import mongoose from 'mongoose';
import logger from '../utils/logger';

/**
 * Establishes connection to MongoDB using Mongoose.
 * Connection options are kept minimal because Mongoose 6+ sets
 * sensible defaults (useNewUrlParser, useUnifiedTopology) automatically.
 *
 * On failure, we exit the process so that orchestrators (Docker, PM2,
 * Render, etc.) can restart the service rather than running in a
 * half-broken state.
 */
const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(mongoUri);

    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${(error as Error).message}`);
    process.exit(1);
  }
};

export default connectDB;
