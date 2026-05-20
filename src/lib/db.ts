import mongoose from "mongoose";
import { cleanupUserProfilePhotos, ensureAdminBootstrap } from "@/lib/bootstrap";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

const MONGODB_URI_STRING = MONGODB_URI;

const globalForMongoose = globalThis as typeof globalThis & {
  mongoose: MongooseCache | undefined;
};

const cached = globalForMongoose.mongoose ?? {
  conn: null,
  promise: null,
};

if (!globalForMongoose.mongoose) {
  globalForMongoose.mongoose = {
    conn: null,
    promise: null,
  };
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI_STRING);
  }

  cached.conn = await cached.promise;
  await cleanupUserProfilePhotos();
  await ensureAdminBootstrap();

  return cached.conn;
}
