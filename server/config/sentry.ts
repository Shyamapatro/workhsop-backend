import { config } from '@/server/config/env';

/**
 * Initializes Sentry for performance monitoring and error tracking.
 * Should only be activated in production to avoid local dashboard noise.
 */

export const initSentry = async () => {
  if (config.nodeEnv === 'production') {
    const Sentry = await import('@sentry/node');
    const { nodeProfilingIntegration } = await import('@sentry/profiling-node');

    Sentry.init({
      dsn: config.sentryDsn || "",
      integrations: [
        nodeProfilingIntegration(),
      ],
      // Performance Monitoring
      tracesSampleRate: 1.0, // Capture 100% of the transactions
    });
  }
};
