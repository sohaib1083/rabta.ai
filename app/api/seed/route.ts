import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import clientPromise from '@/lib/mongodb';
import { LeadModel } from '@/models/Lead';

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connections[0].readyState) {
    return;
  }
  await clientPromise;
  await mongoose.connect(process.env.MONGODB_URI!);
}

// POST /api/seed - Add sample data for testing
export async function POST() {
  try {
    await connectDB();

    // Sample Pakistani real estate leads
    const sampleLeads = [
      {
        phone: '+92-300-1234567',
        name: 'Ahmed Khan',
        source: 'new',
        area: 'DHA Lahore',
        budget: '1.2 - 1.5 Crore PKR',
        status: 'pending',
        callAttempts: 0,
      },
      {
        phone: '+92-321-9876543',
        name: 'Fatima Sheikh',
        source: 'old',
        area: 'Gulshan Iqbal, Karachi',
        budget: '80 Lac - 1 Crore PKR',
        status: 'pending',
        callAttempts: 0,
      },
      {
        phone: '+92-333-5555444',
        name: 'Ali Hassan',
        source: 'new',
        area: 'F-7, Islamabad',
        budget: '50,000 - 80,000 PKR/month',
        status: 'pending',
        callAttempts: 0,
      },
      {
        phone: '+92-345-6789012',
        name: 'Sana Malik',
        source: 'new',
        area: 'Cantt Area, Rawalpindi',
        status: 'pending',
        callAttempts: 0,
      },
      {
        phone: '+92-312-8888777',
        name: 'Muhammad Usman',
        source: 'old',
        area: 'Johar Town, Lahore',
        status: 'pending',
        callAttempts: 0,
      },
    ];

    // Check if we already have data
    const existingCount = await LeadModel.countDocuments();
    if (existingCount > 0) {
      return NextResponse.json({
        success: false,
        message: 'Database already has data. Use DELETE first if you want to reseed.',
        existingCount,
      });
    }

    // Insert sample leads
    const createdLeads = await LeadModel.insertMany(sampleLeads);

    return NextResponse.json({
      success: true,
      message: 'Sample data created successfully',
      count: createdLeads.length,
      data: createdLeads,
    });
  } catch (error) {
    console.error('Error seeding data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed data' },
      { status: 500 }
    );
  }
}

// DELETE /api/seed - Clear all data
export async function DELETE() {
  try {
    await connectDB();

    const result = await LeadModel.deleteMany({});

    return NextResponse.json({
      success: true,
      message: 'All leads deleted successfully',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Error clearing data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear data' },
      { status: 500 }
    );
  }
}