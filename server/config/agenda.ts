import { Agenda } from 'agenda';
import { logger } from '@/server/utils/logger';

import { registerAllJobs } from '@/server/jobs';

import mongoose from 'mongoose';

import { config } from '@/server/config/env';

// Initialize Agenda using connection string directly
export const agenda = new Agenda({
  db: { 
    address: config.mongodbUri as string,
    collection: 'cronJobs'
  }
});

// Register all background jobs from the jobs folder
registerAllJobs(agenda);

// Start Agenda when it is ready
agenda.on('ready', async () => {
  try {
    await agenda.start();
    logger.info('✅ Agenda Job Scheduler started successfully');
  } catch (err) {
    logger.error(err, '❌ Agenda failed to start');
  }
});

agenda.on('error', (err) => {
  logger.error(err, '❌ Agenda connection error');
});

