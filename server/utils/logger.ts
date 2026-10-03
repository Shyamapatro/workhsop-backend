import pino from 'pino';
import { config } from '@/server/config/env';

export const logger = pino({
  level: config.logLevel,
});
