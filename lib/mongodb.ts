import mongoose from "mongoose";

// Cache the connection promise on globalThis so dev-mode hot reloads
// reuse one connection instead of opening a new one per reload.
const globalCache = globalThis as typeof globalThis & {
  mongooseConn?: Promise<typeof mongoose>;
};

export async function connectToDatabase(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Copy .env.example to .env.local.");
  }

  if (!globalCache.mongooseConn) {
    globalCache.mongooseConn = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 5000 })
      .catch((err) => {
        // Drop the failed promise so the next request can retry.
        globalCache.mongooseConn = undefined;
        throw err;
      });
  }
  return globalCache.mongooseConn;
}
