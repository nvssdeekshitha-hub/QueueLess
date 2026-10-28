import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import Service from './models/Service.js';
import seedDatabase from '../scripts/seed.js';

const PORT = process.env.PORT || 5000;

// Initialize database and start HTTP server
const startServer = async () => {
  try {
    await connectDB();
    console.log(`[Database] Database connection initialized.`);

    // If database is empty, auto-seed demo dataset
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      console.log(`[Server] Fresh database detected. Auto-seeding university demo records...`);
      await seedDatabase(false);
    }
  } catch (error) {
    console.error(`[Database Warning] Continuing server startup in offline/diagnostic mode: ${error.message}`);
  }

  const server = app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 QueueLess Backend Server running on port ${PORT}`);
    console.log(`📡 Local API:    http://localhost:${PORT}/api/health`);
    console.log(`📄 EJS Receipts: http://localhost:${PORT}/receipt/:bookingRef`);
    console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`====================================================`);
  });

  // Graceful shutdown handling
  const shutdown = async (signal) => {
    console.log(`\n[System] Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      console.log('[System] HTTP server closed.');
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

startServer();
