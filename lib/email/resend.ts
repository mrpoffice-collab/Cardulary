import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendAddressRequestEmailParams {
  to: string;
  guestName: string;
  organizerName: string;
  eventName: string;
  submissionLink: string;
  customMessage: string;
}

export async function sendAddressRequestEmail(
  params: SendAddressRequestEmailParams
) {
  const { to, guestName, organizerName, eventName, submissionLink, customMessage } = params;

  try {
    const result = await resend.emails.send({
      from: "Cardulary <noreply@cardulary.app>",
      to,
      subject: `${organizerName} needs your mailing address`,
      html: generateEmailHTML(params),
      text: generateEmailText(params),
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Resend email error:", error);
    return { success: false, error };
  }
}

function generateEmailHTML(params: SendAddressRequestEmailParams): string {
  const { guestName, organizerName, eventName, submissionLink, customMessage } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Address Request - ${eventName}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">📮 ${eventName}</h1>
  </div>

  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">
      Hi <strong>${guestName.split(' ')[0]}</strong>!
    </p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      ${customMessage.replace('[link]', '').trim()}
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${submissionLink}"
         style="display: inline-block; background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Submit Your Address
      </a>
    </div>

    <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
      This will take less than 60 seconds. Just fill out a quick form with your mailing address.
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p style="font-size: 12px; color: #9ca3af; text-align: center;">
      🔒 Your address will only be used for ${eventName}.<br>
      We will never spam you or share your information.
    </p>

    <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 20px;">
      Powered by <strong>Cardulary</strong>
    </p>
  </div>

</body>
</html>
  `.trim();
}

function generateEmailText(params: SendAddressRequestEmailParams): string {
  const { guestName, eventName, submissionLink, customMessage } = params;

  return `
Hi ${guestName.split(' ')[0]}!

${customMessage.replace('[link]', '').trim()}

Submit your address here: ${submissionLink}

This will take less than 60 seconds.

---
🔒 Your address will only be used for ${eventName}.
We will never spam you or share your information.

Powered by Cardulary
  `.trim();
}
