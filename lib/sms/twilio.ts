import twilio from "twilio";

let twilioClient: ReturnType<typeof twilio> | null = null;

function getTwilioClient() {
  if (!twilioClient && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
  return twilioClient;
}

export interface SendAddressRequestSMSParams {
  to: string;
  message: string;
  submissionLink: string;
}

export async function sendAddressRequestSMS(params: SendAddressRequestSMSParams) {
  const { to, message, submissionLink } = params;

  const client = getTwilioClient();
  if (!client) {
    return { success: false, error: new Error("Twilio client not configured") };
  }

  // Replace [link] placeholder with actual link
  const fullMessage = message.replace("[link]", submissionLink);

  try {
    const result = await client.messages.create({
      body: fullMessage,
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
      statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio`,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Twilio SMS error:", error);
    return { success: false, error };
  }
}

export function validatePhoneNumber(phone: string): string {
  // Basic phone number validation and formatting
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "");

  // Check if it starts with country code
  if (cleaned.length === 10) {
    // Assume US number, add +1
    return `+1${cleaned}`;
  } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
    // Already has country code
    return `+${cleaned}`;
  }

  // Return as-is if we can't parse
  return phone;
}
