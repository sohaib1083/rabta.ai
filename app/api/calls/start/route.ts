import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { LeadModel } from "@/models/Lead";
import CallAttempt from "@/models/CallAttempt";
import { canTransitionTo, LeadStateTransitionError, LeadStatus } from "@/types/Lead";
import { twilioClient } from "@/lib/twilio";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { leadId } = await req.json();

    // Check Twilio configuration
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      return NextResponse.json({ 
        success: false, 
        error: "Twilio credentials not configured. Please add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to .env.local" 
      }, { status: 500 });
    }

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

    // Make real Twilio call
    const call = await twilioClient.calls.create({
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: lead.phone,
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/voice`,
      statusCallback: `${process.env.NEXT_PUBLIC_BASE_URL}/api/voice/status`,
      statusCallbackEvent: ["answered", "completed", "no-answer", "failed"],
      statusCallbackMethod: "POST"
    });

    return NextResponse.json({ 
      success: true, 
      data: lead.toObject(),
      message: "Call initiated successfully",
      callSid: call.sid
    });
  } catch (error) {
    console.error('Error starting call:', error);
    
    // Handle state transition errors specifically
    if (error instanceof LeadStateTransitionError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: "Failed to start call" },
      { status: 500 }
    );
  }
}