import { NextResponse } from "next/server";

export async function POST() {
  const twiml = `
    <Response>
      <Say voice="alice">
        Assalam o Alaikum.
        Hum aap se property inquiry ke hawale se rabta kar rahe thay.
        Shukriya.
      </Say>
      <Hangup/>
    </Response>
  `;

  return new NextResponse(twiml, {
    headers: { "Content-Type": "text/xml" }
  });
}