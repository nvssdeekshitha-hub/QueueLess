import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../src/config/db.js';

/**
 * Educational Development-Only Script:
 * Demonstrates dropping a database and collections safely in MongoDB.
 *
 * NOTE: For safety, this script will strictly refuse to run in production.
 */
const dropDevDatabase = async () => {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ SAFETY ABORT: Cannot drop database in production environment!');
    process.exit(1);
  }

  try {
    const conn = await connectDB();
    const dbName = conn.connection.name;

    console.log(`\n⚠️  WARNING: You are about to drop development database: "${dbName}"`);
    console.log(`Executing: db.dropDatabase() ...`);

    await conn.connection.db.dropDatabase();

    console.log(`✅ Success: Database "${dbName}" has been completely dropped.`);
    console.log(`You can now re-run "npm run seed" to restore a clean dataset.\n`);
  } catch (error) {
    console.error('❌ Error dropping database:', error.message);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

dropDevDatabase();
