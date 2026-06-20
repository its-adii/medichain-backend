import nodemailer from "nodemailer";
import dns from "dns";
import { promisify } from "util";

const resolve4 = promisify(dns.resolve4);

let transporter;

async function getTransporter() {
  if (transporter) return transporter;

  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = process.env.SMTP_PORT || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  console.log(`[SMTP Config] Connecting to ${smtpHost}:${smtpPort} as ${smtpUser} (Strict IPv4 Lookup)`);

  if (smtpHost && smtpUser && smtpPass) {
    let hostIp = smtpHost;
    
    try {
      const addresses = await resolve4(smtpHost);
      if (addresses && addresses.length > 0) {
        hostIp = addresses[0];
        console.log(`[SMTP Config] Resolved ${smtpHost} to IPv4: ${hostIp}`);
      }
    } catch (err) {
      console.warn(`[SMTP Config] Failed to resolve IPv4 for ${smtpHost}. Error:`, err.message);
    }

    transporter = nodemailer.createTransport({
      host: hostIp,
      port: parseInt(smtpPort),
      secure: parseInt(smtpPort) === 465, // true for 465, false for 587
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
        servername: smtpHost // Required so TLS doesn't fail when connecting via IP
      },
      connectionTimeout: 10000, // 10s connection timeout
      greetingTimeout: 10000,
      socketTimeout: 10000
    });
  }
  return transporter;
}

export async function sendEmail({ to, subject, text, html }) {
  console.log(`[Email Service] Start sending email to: ${to}, Subject: "${subject}"`);
  try {
    const client = await getTransporter();
    if (!client) {
      console.warn("[Email Service] SMTP transporter not configured. Skipping email send.");
      return;
    }

    const info = await client.sendMail({
      from: `"MediChain" <${process.env.SMTP_USER || "noreply@medichain.com"}>`,
      to,
      subject,
      text,
      html,
    });
    
    console.log(`[Email Service] Success! Message sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("[Email Service] ERROR sending email:", error);
  }
}
