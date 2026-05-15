const mongoose = require("mongoose");

/** Reuse connection across Vercel serverless invocations */
let cached = global.__mongooseCoaching;
if (!cached) {
  cached = global.__mongooseCoaching = { conn: null, promise: null };
}

const dbConnect = async () => {
  if (!process.env.MONGODB_URI) {
    const err = new Error("MONGODB_URI is not set");
    console.error(err.message);
    if (process.env.VERCEL) throw err;
    process.exit(1);
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, opts)
      .then((m) => m.connection)
      .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    console.log("MongoDB connected successfully");
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error("MongoDB connection error:", error.message);
    if (process.env.VERCEL) {
      throw error;
    }
    process.exit(1);
  }
};

module.exports = dbConnect;