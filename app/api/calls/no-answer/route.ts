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

    // Update the latest call attempt to no_answer
    await CallAttempt.findOneAndUpdate(
      { leadId },
      { status: "no_answer" },
      { sort: { createdAt: -1 } }
    );

    // Implement retry logic
    if (lead.callAttempts >= 2) {
      // After 2 failed attempts, drop the lead
      if (!canTransitionTo(lead.status as LeadStatus, 'dropped')) {
        throw new LeadStateTransitionError(lead.status as LeadStatus, 'dropped');
      }
      
      lead.status = "dropped";
      await lead.save();

      return NextResponse.json({ 
        success: true, 
        data: lead.toObject(),
        message: "Lead dropped after 2 failed attempts"
      });
    } else {
      // Return to pending for retry
      if (!canTransitionTo(lead.status as LeadStatus, 'pending')) {
        throw new LeadStateTransitionError(lead.status as LeadStatus, 'pending');
      }
      
      lead.status = "pending";
      await lead.save();

      return NextResponse.json({ 
        success: true, 
        data: lead.toObject(),
        message: "Call marked as no answer, lead returned to pending"
      });
    }
  } catch (error) {
    console.error('Error marking no answer:', error);
    
    // Handle state transition errors specifically
    if (error instanceof LeadStateTransitionError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: "Failed to mark no answer" },
      { status: 500 }
    );
  }
}