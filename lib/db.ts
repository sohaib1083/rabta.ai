import mongoose from 'mongoose';
import clientPromise from '@/lib/mongodb';

// Connect to MongoDB
export async function connectDB() {
  if (mongoose.connections[0].readyState) {
    return;
  }
  await clientPromise;
  await mongoose.connect(process.env.MONGODB_URI!);
}