import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../src/models/User.js';
import { connectDB, disconnectDB } from '../src/config/db.js';

/**
 * Initialize First Administrator Account Securely
 * Usage:
 *   node scripts/initAdmin.js
 * Or with custom environment variables:
 *   ADMIN_NAME="Admin" ADMIN_EMAIL="admin@queueless.edu" ADMIN_PASSWORD="YourSecurePassword" node scripts/initAdmin.js
 */
const initAdmin = async () => {
  try {
    await connectDB();

    const name = process.env.ADMIN_NAME || 'System Administrator';
    const email = (process.env.ADMIN_EMAIL || 'admin@queueless.edu').toLowerCase();
    const password = process.env.ADMIN_PASSWORD || 'AdminSecure2026!';

    let admin = await User.findOne({ email });

    if (admin) {
      console.log(`[InitAdmin] Admin account with email ${email} already exists.`);
      console.log(`[InitAdmin] Ensuring admin role and active status...`);
      admin.role = 'admin';
      admin.isActive = true;
      admin.password = password; // Will be hashed by pre-save hook
      await admin.save();
      console.log(`[InitAdmin] Password and role updated successfully.`);
    } else {
      admin = await User.create({
        name,
        email,
        password,
        role: 'admin',
        department: 'Central Administration',
      });
      console.log(`[InitAdmin] New Administrator account created:`);
      console.log(` - Name: ${admin.name}`);
      console.log(` - Email: ${admin.email}`);
      console.log(` - Role: ${admin.role}`);
    }

    console.log(`[InitAdmin] Administrator initialized successfully.`);
  } catch (error) {
    console.error(`[InitAdmin Error]:`, error.message);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

initAdmin();
