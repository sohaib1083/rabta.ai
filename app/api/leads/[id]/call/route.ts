import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import clientPromise from '@/lib/mongodb';
import { LeadModel } from '@/models/Lead';
import { canTransitionTo, LeadStateTransitionError, LeadStatus } from '@/types/Lead';

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connections[0].readyState) {
    return;
  }
  await clientPromise;
  await mongoose.connect(process.env.MONGODB_URI!);
}

// POST /api/leads/[id]/call - Initiate AI call
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid lead ID' },
        { status: 400 }
      );
    }

    const lead = await LeadModel.findById(id);

    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Validate state transition to "calling"
    if (!canTransitionTo(lead.status as LeadStatus, 'calling')) {
      throw new LeadStateTransitionError(lead.status as LeadStatus, 'calling');
    }

    // Update lead status to "calling" and increment call attempts
    lead.status = 'calling';
    lead.callAttempts = (lead.callAttempts || 0) + 1;
    lead.lastCallAt = new Date();

    await lead.save();

    // Simulate AI call processing (2-5 seconds)
    const processingTime = Math.random() * 3000 + 2000;
    await new Promise(resolve => setTimeout(resolve, processingTime));

    // Simulate AI classification
    const roles = ['buyer', 'seller', 'renter'];
    const results = ['hot', 'warm', 'cold'];
    
    const randomRole = roles[Math.floor(Math.random() * roles.length)];
    const randomResult = results[Math.floor(Math.random() * results.length)];

    // Update lead with AI results
    lead.status = 'answered';
    lead.role = randomRole as 'buyer' | 'seller' | 'renter';
    lead.result = randomResult as 'hot' | 'warm' | 'cold';

    await lead.save();

    // Final qualification status (validate this transition too)
    if (canTransitionTo('answered', 'qualified')) {
      lead.status = 'qualified';
      await lead.save();
    }

    return NextResponse.json({
      success: true,
      data: lead.toObject(),
      message: `Call completed! Classified as ${randomRole.toUpperCase()}, lead is ${randomResult.toUpperCase()}.`
    });

  } catch (error) {
    console.error('Error processing call:', error);
    
    // Handle state transition errors specifically
    if (error instanceof LeadStateTransitionError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to process call' },
      { status: 500 }
    );
  }
}