import mongoose from 'mongoose';
import net from 'net';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer = null;

/**
 * Check if a TCP port is open (used to detect local MongoDB daemon)
 */
const isPortOpen = (port, host = '127.0.0.1') => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);

    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.once('error', () => {
      resolve(false);
    });

    socket.connect(port, host);
  });
};

/**
 * Connect to MongoDB database
 * Supports MongoDB Atlas, local MongoDB (27017), or automatic embedded dev engine.
 */
export const connectDB = async (uri = process.env.MONGODB_URI) => {
  // 1. Explicit connection string specified (e.g. Atlas)
  if (uri) {
    try {
      const conn = await mongoose.connect(uri, {
        autoIndex: true,
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (err) {
      console.error(`[Database Error] Failed to connect to configured MONGODB_URI: ${err.message}`);
      throw err;
    }
  }

  // 2. Check if a local MongoDB service is actively listening on port 27017
  const localRunning = await isPortOpen(27017);

  if (localRunning) {
    console.log(`[Database] Detected active local MongoDB daemon on 127.0.0.1:27017.`);
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/queueless', {
      autoIndex: true,
    });
    console.log(`[Database] Local MongoDB Connected: ${conn.connection.name}`);
    return conn;
  }

  // 3. If no daemon is running, start the pre-cached embedded engine
  console.log(`[Database Notice] No local MongoDB daemon detected on port 27017.`);
  console.log(`[Database Notice] Launching embedded development MongoDB engine (x64)...`);

  try {
    memoryServer = await MongoMemoryServer.create({
      binary: {
        version: '6.0.14',
        arch: 'x64',
      },
      instance: {
        dbName: 'queueless',
      },
    });

    const memoryUri = memoryServer.getUri();
    process.env.MONGODB_URI = memoryUri;

    const conn = await mongoose.connect(memoryUri, {
      autoIndex: true,
    });

    console.log(`[Database] Embedded MongoDB Engine active: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (memErr) {
    console.error(`[Database Error] Could not start embedded database: ${memErr.message}`);
    throw memErr;
  }
};

/**
 * Disconnect from MongoDB database (used in test teardown or graceful shutdown)
 */
export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = null;
    }
    console.log('[Database] MongoDB connection closed.');
  } catch (error) {
    console.error(`[Database Error] Error disconnecting: ${error.message}`);
  }
};
