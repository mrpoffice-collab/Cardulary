import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export interface SendAddressRequestSMSParams {
  to: string;
  message: string;
  submissionLink: string;
}

export async function sendAddressRequestSMS(params: SendAddressRequestSMSParams) {
  const { to, message, submissionLink } = params;

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
