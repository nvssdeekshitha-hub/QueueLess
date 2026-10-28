import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';

/**
 * Configure Express session with MongoDB-backed store
 * Resolves active MongoClient as soon as Mongoose connects.
 */
export const createSessionMiddleware = () => {
  const secret = process.env.SESSION_SECRET || 'queueless_super_secret_session_key_2026';
  const isProduction = process.env.NODE_ENV === 'production';
  const maxAge = Number(process.env.SESSION_MAX_AGE_MS) || 24 * 60 * 60 * 1000; // 24 hours

  let store;

  try {
    store = MongoStore.create({
      clientPromise: new Promise((resolve) => {
        if (mongoose.connection.readyState === 1) {
          resolve(mongoose.connection.getClient());
        } else {
          mongoose.connection.once('connected', () => {
            resolve(mongoose.connection.getClient());
          });
        }
      }),
      collectionName: 'sessions',
      ttl: maxAge / 1000,
      autoRemove: 'native',
    });
  } catch (err) {
    console.warn('[Session Warning] Could not initialize MongoStore, falling back to memory store:', err.message);
  }

  return session({
    name: 'queueless.sid',
    secret,
    resave: false,
    saveUninitialized: false,
    store: store || undefined,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge,
    },
  });
};
