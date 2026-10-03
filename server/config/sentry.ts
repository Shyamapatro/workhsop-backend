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
      dsn: config.sentryDsn || "https://74d52cba6072dbb0445e5e92cdb461db@o4512191400443904.ingest.us.sentry.io/4512191406342144",
      integrations: [
        nodeProfilingIntegration(),
      ],
      // Tracing
      tracesSampleRate: 1.0, // Capture 100% of the transactions
      
      // Set sampling rate for profiling - this is evaluated only once per SDK.init call
      profileSessionSampleRate: 1.0,
      
      // Trace lifecycle automatically enables profiling during active traces
      profileLifecycle: 'trace',
    });
  }
};
