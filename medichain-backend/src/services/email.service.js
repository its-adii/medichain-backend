import nodemailer from "nodemailer";

let transporter;

async function getTransporter() {
  if (transporter) return transporter;

  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = process.env.SMTP_PORT || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    const isGmail = smtpHost.toLowerCase().includes("gmail");
    transporter = nodemailer.createTransport(
      isGmail
        ? {
            service: "gmail",
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
          }
        : {
            host: smtpHost,
            port: parseInt(smtpPort),
            secure: smtpPort == 465,
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
            tls: {
              rejectUnauthorized: false
            }
          }
    );
  }
  return transporter;
}

export async function sendEmail({ to, subject, text, html }) {
  try {
    const client = await getTransporter();
    if (!client) {
      console.warn("Email service not configured. Please check SMTP_USER and SMTP_PASS in your .env file.");
      return;
    }

    const info = await client.sendMail({
      from: `"MediChain" <${process.env.SMTP_USER || "noreply@medichain.com"}>`,
      to,
      subject,
      text,
      html,
    });
    
    console.log(`Message sent successfully via SMTP: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Email sending failed via SMTP:", error);
  }
}
