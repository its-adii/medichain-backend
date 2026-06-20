import { Resend } from "resend";

let resend;

function getResendClient() {
  if (resend) return resend;

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.warn("WARNING: RESEND_API_KEY is not defined in the environment variables. Email service is disabled or will fail.");
    return null;
  }

  resend = new Resend(resendApiKey);
  return resend;
}

export async function sendEmail({ to, subject, text, html }) {
  try {
    const client = getResendClient();
    if (!client) {
      console.warn("Skipping email send: Resend is not configured (missing API key).");
      return;
    }

    const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    const response = await client.emails.send({
      from,
      to,
      subject,
      text,
      html,
    });

    if (response.error) {
      console.error("Email sending failed via Resend API error:", response.error);
      return response;
    }

    console.log(`Message sent via Resend. ID: ${response.data?.id}`);
    return response.data;
  } catch (error) {
    console.error("Email sending failed via Resend catch block:", error);
  }
}
