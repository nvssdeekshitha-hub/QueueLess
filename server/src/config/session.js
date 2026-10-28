import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';

/**
 * Configure Express session with MongoDB-backed store
 * Falls back gracefully to memory store during testing or if DB is offline.
 */
export const createSessionMiddleware = () => {
  const secret = process.env.SESSION_SECRET || 'queueless_super_secret_session_key_2026';
  const isProduction = process.env.NODE_ENV === 'production';
  const maxAge = Number(process.env.SESSION_MAX_AGE_MS) || 24 * 60 * 60 * 1000; // 24 hours

  let store;
  const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/queueless';

  try {
    // If mongoose is connected or URI is present, use connect-mongo
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      store = MongoStore.create({
        client: mongoose.connection.getClient(),
        collectionName: 'sessions',
        ttl: maxAge / 1000,
        autoRemove: 'native',
      });
    } else if (process.env.NODE_ENV !== 'test') {
      store = MongoStore.create({
        mongoUrl,
        collectionName: 'sessions',
        ttl: maxAge / 1000,
        autoRemove: 'native',
      });
    }
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
      httpOnly: true, // Prevents client-side script from accessing the cookie
      secure: isProduction, // HTTPS required in production
      sameSite: isProduction ? 'none' : 'lax', // CSRF protection
      maxAge,
    },
  });
};
