import { connectDB } from "@/lib/db";
import { LeadModel } from "@/models/Lead";
import CallAttempt from "@/models/CallAttempt";
import { NextResponse } from "next/server";
import { canTransitionTo, LeadStatus } from "@/types/Lead";

export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.formData();

    const callStatus = data.get("CallStatus") as string;
    const to = data.get("To") as string;
    const callSid = data.get("CallSid") as string;

    console.log(`Twilio callback: ${callStatus} for ${to}, Call SID: ${callSid}`);

    const lead = await LeadModel.findOne({ phone: to });
    if (!lead) {
      console.log(`Lead not found for phone: ${to}`);
      return NextResponse.json({ ok: true });
    }

    // Update lead status based on call outcome
    let newStatus: LeadStatus = lead.status as LeadStatus;

    if (callStatus === "answered") {
      if (canTransitionTo(lead.status as LeadStatus, 'answered')) {
        newStatus = "answered";
      }
    }

    if (["no-answer", "failed", "busy", "canceled"].includes(callStatus)) {
      // Implement retry logic
      if (lead.callAttempts >= 2) {
        // After 2 failed attempts, drop the lead
        if (canTransitionTo(lead.status as LeadStatus, 'dropped')) {
          newStatus = "dropped";
        }
      } else {
        // Return to pending for retry
        if (canTransitionTo(lead.status as LeadStatus, 'pending')) {
          newStatus = "pending";
        }
      }
    }

    // Only update if status actually changed
    if (newStatus !== lead.status) {
      lead.status = newStatus;
      await lead.save();
      console.log(`Lead ${lead._id} status updated to: ${newStatus}`);
    }

    // Update the latest call attempt with the final status
    await CallAttempt.findOneAndUpdate(
      { leadId: lead._id },
      { 
        status: callStatus === "answered" ? "answered" : 
                ["no-answer", "failed", "busy", "canceled"].includes(callStatus) ? "no_answer" : 
                callStatus 
      },
      { sort: { createdAt: -1 } }
    );

    return NextResponse.json({ 
      ok: true, 
      leadStatus: newStatus, 
      callStatus: callStatus 
    });
  } catch (error) {
    console.error('Error processing Twilio status callback:', error);
    return NextResponse.json({ 
      ok: true, 
      error: 'Internal error' 
    });
  }
}