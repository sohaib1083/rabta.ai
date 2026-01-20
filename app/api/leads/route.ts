import { NextRequest, NextResponse } from 'next/server';
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

// GET /api/leads - Get all leads with optional filtering
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const result = searchParams.get('result');
    const role = searchParams.get('role');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    // Build filter object
    const filter: Record<string, string> = {};
    if (status) filter.status = status;
    if (result) filter.result = result;
    if (role) filter.role = role;

    // Get total count for pagination
    const total = await LeadModel.countDocuments(filter);

    // Get leads with pagination
    const leads = await LeadModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    // Calculate stats
    const stats = await LeadModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          calling: { $sum: { $cond: [{ $eq: ['$status', 'calling'] }, 1, 0] } },
          answered: { $sum: { $cond: [{ $eq: ['$status', 'answered'] }, 1, 0] } },
          qualified: { $sum: { $cond: [{ $eq: ['$status', 'qualified'] }, 1, 0] } },
          dropped: { $sum: { $cond: [{ $eq: ['$status', 'dropped'] }, 1, 0] } },
          hotLeads: { $sum: { $cond: [{ $eq: ['$result', 'hot'] }, 1, 0] } },
          warmLeads: { $sum: { $cond: [{ $eq: ['$result', 'warm'] }, 1, 0] } },
          coldLeads: { $sum: { $cond: [{ $eq: ['$result', 'cold'] }, 1, 0] } },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: leads,
      stats: stats[0] || {
        total: 0,
        pending: 0,
        calling: 0,
        answered: 0,
        qualified: 0,
        dropped: 0,
        hotLeads: 0,
        warmLeads: 0,
        coldLeads: 0,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

// POST /api/leads - Create new lead
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { phone, name, source, area, budget } = body;

    // Validate required fields
    if (!phone || !source) {
      return NextResponse.json(
        { success: false, error: 'Phone and source are required' },
        { status: 400 }
      );
    }

    // Check if lead already exists
    const existingLead = await LeadModel.findOne({ phone });
    if (existingLead) {
      return NextResponse.json(
        { success: false, error: 'Lead with this phone number already exists' },
        { status: 400 }
      );
    }

    // Create new lead
    const newLead = await LeadModel.create({
      phone,
      name: name || null,
      source,
      area: area || null,
      budget: budget || null,
      status: 'pending',
      callAttempts: 0,
    });

    return NextResponse.json({
      success: true,
      data: newLead,
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}