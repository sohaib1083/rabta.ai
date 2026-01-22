import { connectDB } from "@/lib/db";
import { LeadModel } from "@/models/Lead";
import CallAttempt from "@/models/CallAttempt";
import { NextResponse } from "next/server";
import { canTransitionTo, LeadStateTransitionError, LeadStatus } from "@/types/Lead";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { leadId } = await req.json();

    const lead = await LeadModel.findById(leadId);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Check if lead can transition to answered
    if (!canTransitionTo(lead.status as LeadStatus, 'answered')) {
      throw new LeadStateTransitionError(lead.status as LeadStatus, 'answered');
    }

    // Update lead status to answered
    lead.status = "answered";
    await lead.save();

    // Update the latest call attempt
    await CallAttempt.findOneAndUpdate(
      { leadId },
      { status: "answered" },
      { sort: { createdAt: -1 } }
    );

    return NextResponse.json({ 
      success: true, 
      data: lead.toObject(),
      message: "Call marked as answered"
    });
  } catch (error) {
    console.error('Error marking call as answered:', error);
    
    // Handle state transition errors specifically
    if (error instanceof LeadStateTransitionError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: "Failed to mark call as answered" },
      { status: 500 }
    );
  }
}