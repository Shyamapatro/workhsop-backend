import dotenv from 'dotenv';
import path from 'path';

// Note: In Next.js/Fastify, you might want to load .env.local in dev
// dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export const config = {
  port: 8000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI,
  sentryDsn: process.env.SENTRY_DSN,
  logLevel:'info',
  
  // Workshop specific
  workshopWhatsappLink: process.env.WORKSHOP_WHATSAPP_LINK || '',
  workshopDate: process.env.WORKSHOP_DATE || '',
  workshopTime: process.env.WORKSHOP_TIME || '',
  
  // Providers
  whatsappProvider: process.env.WHATSAPP_PROVIDER || 'aisensy',
  aisensyApiKey: process.env.AISENSY_API_KEY,
  aisensyProjectId: process.env.AISENSY_PROJECT_ID,
};
