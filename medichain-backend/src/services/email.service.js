import nodemailer from "nodemailer";

let transporter;

async function getTransporter() {
  if (transporter) return transporter;

  const smtpHost = process.env.SMTP_HOST;
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
              // Do not fail on invalid certificates (optional helper but good for robustness)
              rejectUnauthorized: false
            }
          }
    );
  } else {
    console.log("No SMTP credentials found in env. Generating Ethereal test email account...");
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`Ethereal email configured. User: ${testAccount.user}`);
    } catch (err) {
      console.error("Failed to generate Ethereal account, email service disabled.", err.message);
    }
  }

  return transporter;
}

export async function sendEmail({ to, subject, text, html }) {
  try {
    const client = await getTransporter();
    if (!client) return;

    const info = await client.sendMail({
      from: `"MediChain" <${process.env.SMTP_USER || "noreply@medichain.com"}>`,
      to,
      subject,
      text,
      html,
    });
    console.log(`Message sent: ${info.messageId}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`Preview URL: ${previewUrl}`);
    }
    return info;
  } catch (error) {
    console.error("Email sending failed:", error);
  }
}
