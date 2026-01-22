import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { LeadModel } from "@/models/Lead";
import CallAttempt from "@/models/CallAttempt";
import { canTransitionTo, LeadStateTransitionError, LeadStatus } from "@/types/Lead";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { leadId } = await req.json();

    const lead = await LeadModel.findById(leadId);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Check if lead can transition to calling
    if (!canTransitionTo(lead.status as LeadStatus, 'calling')) {
      throw new LeadStateTransitionError(lead.status as LeadStatus, 'calling');
    }

    // Update lead status
    lead.status = "calling";
    lead.callAttempts = (lead.callAttempts || 0) + 1;
    lead.lastCallAt = new Date();
    await lead.save();

    // Log the call attempt
    await CallAttempt.create({
      leadId,
      attemptNumber: lead.callAttempts,
      status: "initiated"
    });

    // Return manual dialing instructions
    return NextResponse.json({ 
      success: true, 
      data: lead.toObject(),
      message: "Ready for manual dial",
      manualDialing: {
        phoneNumber: lead.phone,
        instruction: `Call ${lead.phone} from your phone (+923330220803)`,
        script: "Assalam o Alaikum. Hum aap se property inquiry ke hawale se rabta kar rahe thay. Shukriya.",
        leadId: leadId
      }
    });
  } catch (error) {
    console.error('Error preparing manual call:', error);
    
    if (error instanceof LeadStateTransitionError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: "Failed to prepare manual call" },
      { status: 500 }
    );
  }
}