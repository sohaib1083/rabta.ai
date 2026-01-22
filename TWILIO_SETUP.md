# Twilio Setup Guide for Real Phone Calls

## Step 1: Create Twilio Account

1. Go to [https://www.twilio.com/](https://www.twilio.com/)
2. Sign up for a free account
3. Verify your phone number

## Step 2: Get Twilio Credentials

1. Go to [Twilio Console](https://console.twilio.com/)
2. Find your **Account SID** and **Auth Token** on the dashboard
3. Copy these values

## Step 3: Get a Phone Number

1. In Twilio Console, go to **Phone Numbers** > **Buy a Number**
2. Choose a number (trial account gets one free number)
3. Buy the number
4. Configure the number:
   - Voice webhook: `http://your-domain.com/api/voice`
   - Status callback: `http://your-domain.com/api/voice/status`

## Step 4: Update Environment Variables

Update your `.env.local` file:

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_from_twilio_console
TWILIO_PHONE_NUMBER=+15551234567
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Step 5: Test the Integration

1. Add a lead with your phone number
2. Click "Call Now"
3. Your phone should ring!
4. Answer to hear: "Assalam o Alaikum. Hum aap se property inquiry ke hawale se rabta kar rahe thay. Shukriya."

## Webhooks for Production

For production, you'll need:

- A public domain (use ngrok for testing)
- HTTPS endpoints
- Update `NEXT_PUBLIC_BASE_URL` to your domain

## Webhook URLs

- Voice: `https://yourdomain.com/api/voice`
- Status: `https://yourdomain.com/api/voice/status`

## Call Flow

1. User clicks "Call Now"
2. API calls Twilio
3. Twilio calls the lead's phone
4. If answered, plays static message
5. Twilio sends status to `/api/voice/status`
6. Database updates lead status automatically
7. UI reflects real call outcomes

## Success Criteria

✅ Your phone rings when you click "Call Now"  
✅ Static message plays when answered  
✅ Lead status updates from "calling" → "answered" or "pending"  
✅ Retry logic works (2 attempts max)  
✅ UI shows real call outcomes

## Troubleshooting

- Check Twilio console for call logs
- Check browser network tab for API errors
- Check server logs for webhook errors
- Verify webhook URLs are publicly accessible
