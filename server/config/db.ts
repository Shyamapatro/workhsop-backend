import mongoose from 'mongoose';
import { config } from '@/server/config/env';

import { logger } from '@/server/utils/logger';

// Ensure all models are registered with Mongoose before any queries
import '@/server/models';


/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  const MONGODB_URI = config.mongodbUri;
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI!).then((mongoose) => {
      logger.info('✅ Successfully connected to MongoDB Atlas');
      return mongoose;
    }).catch(err => {
      logger.error(err, '❌ Failed to connect to MongoDB');
      throw err;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export async function disconnectFromDatabase() {
  if (cached.conn) {
    await mongoose.connection.close();
    cached.conn = null;
    cached.promise = null;
  }
}

export default connectToDatabase;
