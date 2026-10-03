import fastify, { FastifyError } from 'fastify';
import cors from '@fastify/cors';

import connectToDatabase, {
  disconnectFromDatabase,
} from '@/server/config/db';

import routes from '@/server/routes';

import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';

import { formatError } from '@/server/utils/response';
import {
  HTTP_STATUS,
  ERROR_CODES,
} from '@/server/config/constants';

import { initSentry } from '@/server/config/sentry';
import { config } from '@/server/config/env';
import { AppError } from '@/server/utils/AppError';

// --------------------------------------------------
// Sentry
// --------------------------------------------------

initSentry();

// --------------------------------------------------
// Fastify
// --------------------------------------------------

const app = fastify({
  logger: true,
}).withTypeProvider<ZodTypeProvider>();

// --------------------------------------------------
// Zod
// --------------------------------------------------

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// --------------------------------------------------
// Error Handler
// --------------------------------------------------

app.setErrorHandler(
  async (
    error: FastifyError | AppError,
    request,
    reply,
  ) => {
    // -------------------------------
    // Validation Error
    // -------------------------------

    if ('validation' in error && error.validation) {
      app.log.warn(
        {
          errors: error.validation,
          url: request.url,
          method: request.method,
        },
        'Validation failed',
      );

      return reply.status(HTTP_STATUS.BAD_REQUEST).send(
        formatError(
          'Validation failed. Please check your request parameters.',
          ERROR_CODES.VALIDATION_ERROR,
          error.validation,
        ),
      );
    }

    // -------------------------------
    // Application Error
    // -------------------------------

    if (error instanceof AppError) {
      app.log.warn(
        {
          message: error.message,
          statusCode: error.statusCode,
          errorCode: error.errorCode,
        },
        'Application error',
      );

      return reply.status(error.statusCode).send(
        formatError(
          error.message,
          error.errorCode,
        ),
      );
    }

    // -------------------------------
    // Unexpected Error
    // -------------------------------

    if (config.nodeEnv === 'production') {
      try {
        const Sentry = await import('@sentry/node');

        Sentry.captureException(error);
      } catch (sentryError) {
        app.log.error(
          sentryError,
          'Failed to report error to Sentry',
        );
      }
    }

    app.log.error(
      {
        error,
        url: request.url,
        method: request.method,
      },
      'Unexpected server error',
    );

    return reply.status(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    ).send(
      formatError(
        error.message || 'Oops! Something went wrong.',
        ERROR_CODES.UNKNOWN_ERROR,
      ),
    );
  },
);

// --------------------------------------------------
// CORS
// --------------------------------------------------

app.register(cors, {
  origin: true,
});

// --------------------------------------------------
// Routes
// --------------------------------------------------

app.register(routes);

// --------------------------------------------------
// Application State
// --------------------------------------------------

let isShuttingDown = false;
let shutdownTimer: NodeJS.Timeout | undefined;

// --------------------------------------------------
// Start Server
// --------------------------------------------------

const start = async () => {
  try {
    app.log.info('Starting application...');

    // ---------------------------------------------
    // Connect MongoDB
    // ---------------------------------------------

    await connectToDatabase();

    app.log.info('Database connected.');

    // ---------------------------------------------
    // Initialize Agenda
    // ---------------------------------------------

    const { agenda } = await import(
      '@/server/config/agenda'
    );

    // Start Agenda only if your agenda module
    // does NOT already call agenda.start()
    await agenda.start();

    app.log.info('Agenda started.');

    // ---------------------------------------------
    // Start Fastify
    // ---------------------------------------------

    await app.listen({
      port: config.port,
      host: '0.0.0.0',
    });

    app.log.info(
      `Server listening on port ${config.port}`,
    );
  } catch (error) {
    app.log.error(
      error,
      'Failed to start application',
    );

    process.exit(1);
  }
};

// --------------------------------------------------
// Graceful Shutdown
// --------------------------------------------------

const gracefulShutdown = async (
  signal: string,
) => {
  // Prevent multiple shutdown calls
  if (isShuttingDown) {
    app.log.warn(
      `Shutdown already in progress. Ignoring ${signal}`,
    );

    return;
  }

  isShuttingDown = true;

  app.log.info(
    `Received ${signal}. Starting graceful shutdown...`,
  );

  // ---------------------------------------------
  // Force shutdown after 3 seconds
  // ---------------------------------------------

  shutdownTimer = setTimeout(() => {
    app.log.error(
      'Graceful shutdown timed out. Forcefully exiting.',
    );

    process.exit(1);
  }, 3000);

  try {
    // ---------------------------------------------
    // Stop Agenda
    // ---------------------------------------------

    try {
      const { agenda } = await import(
        '@/server/config/agenda'
      );

      await agenda.stop();

      app.log.info('Agenda stopped.');
    } catch (error) {
      app.log.error(
        error,
        'Failed to stop Agenda',
      );
    }

    // ---------------------------------------------
    // Close Fastify
    // ---------------------------------------------

    await app.close();

    app.log.info('Fastify server closed.');

    // ---------------------------------------------
    // Disconnect MongoDB
    // ---------------------------------------------

    await disconnectFromDatabase();

    app.log.info('Database connection closed.');

    // ---------------------------------------------
    // Clear force shutdown timer
    // ---------------------------------------------

    if (shutdownTimer) {
      clearTimeout(shutdownTimer);
      shutdownTimer = undefined;
    }

    // ---------------------------------------------
    // Nodemon Restart
    // ---------------------------------------------

    if (signal === 'SIGUSR2') {
      app.log.info(
        'Shutdown complete. Exiting for nodemon restart.',
      );
      process.exit(0);
    }

    // ---------------------------------------------
    // Normal Shutdown
    // ---------------------------------------------

    app.log.info(
      'Graceful shutdown completed.',
    );

    process.exit(0);
  } catch (error) {
    if (shutdownTimer) {
      clearTimeout(shutdownTimer);
      shutdownTimer = undefined;
    }

    app.log.error(
      error,
      'Error during graceful shutdown',
    );

    process.exit(1);
  }
};

// --------------------------------------------------
// Process Signals
// --------------------------------------------------

process.on('SIGINT', () => {
  void gracefulShutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void gracefulShutdown('SIGTERM');
});

// Nodemon restart
process.once('SIGUSR2', () => {
  void gracefulShutdown('SIGUSR2');
});

// --------------------------------------------------
// Start
// --------------------------------------------------

void start();