import nodemailer from "nodemailer";
import dns from "dns";

// Force Node.js to prefer IPv4 DNS resolution over IPv6 to prevent ENETUNREACH errors on cloud hosts like Render
if (dns && typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

let transporter;

async function getTransporter() {
  if (transporter) return transporter;

  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = process.env.SMTP_PORT || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  console.log(`[SMTP Config] Connecting to ${smtpHost}:${smtpPort} as ${smtpUser} (IPv4 preferred)`);

  if (smtpHost && smtpUser && smtpPass) {
    // Avoid using "service: gmail" shortcut as it forces port 465 and secure: true,
    // which fails on containers without IPv6 routing. Instead, configure manually.
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: parseInt(smtpPort) === 465, // true for 465, false for 587 (STARTTLS)
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        // Do not fail on invalid certificates
        rejectUnauthorized: false
      }
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
