import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 * Supports MongoDB Atlas connection string or local MongoDB instance.
 */
export const connectDB = async (uri = process.env.MONGODB_URI) => {
  const mongoURI = uri || 'mongodb://localhost:27017/queueless';

  try {
    const conn = await mongoose.connect(mongoURI, {
      autoIndex: true, // Build indexes in development
      serverSelectionTimeoutMS: 5000, // Timeout after 5s if server not found
    });

    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    console.error(`[Database Hint] Ensure MONGODB_URI is correctly configured in your .env file.`);
    console.error(`[Database Hint] For MongoDB Atlas: check network access (IP whitelist 0.0.0.0/0) & credentials.`);
    console.error(`[Database Hint] For Local MongoDB: verify that the 'mongod' daemon service is active.`);
    // Re-throw in test/production or allow caller to handle
    throw error;
  }
};

/**
 * Disconnect from MongoDB database (used in test teardown or graceful shutdown)
 */
export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('[Database] MongoDB connection closed.');
  } catch (error) {
    console.error(`[Database Error] Error disconnecting from MongoDB: ${error.message}`);
  }
};
