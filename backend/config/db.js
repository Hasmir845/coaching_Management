const mongoose = require('mongoose');

/** Reuse connection across Vercel serverless invocations */
let cached = global.__mongooseCoaching;
if (!cached) {
  cached = global.__mongooseCoaching = { conn: null, promise: null };
}

const dbConnect = async () => {
  if (!process.env.MONGODB_URI) {
    const err = new Error('MONGODB_URI is not set');
    console.error(err.message);
    if (process.env.VERCEL) throw err;
    process.exit(1);
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      },
    };
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, opts)
      .then((m) => m.connection);
  }

  try {
    cached.conn = await cached.promise;
    console.log('MongoDB Atlas connected successfully');
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error('MongoDB Atlas connection error:', error);
    if (process.env.VERCEL) {
      throw error;
    }
    process.exit(1);
  }
};

module.exports = dbConnect;
