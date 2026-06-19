export function getVerificationEmailTemplate(name, otp) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #0891b2; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">MediChain</h1>
        <p style="color: #64748b; font-size: 12px; margin: 5px 0 0 0; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Secure Medical Registry</p>
      </div>
      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-bottom: 25px;" />
      <h2 style="color: #0f172a; font-size: 18px; font-weight: 700; margin-top: 0; margin-bottom: 10px;">Verify your email address</h2>
      <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">Hello <strong>${name}</strong>,</p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 25px 0;">Thank you for choosing MediChain. Please enter the following 6-digit one-time passcode (OTP) on the verification screen to complete your registration. This passcode is valid for 15 minutes.</p>
      <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #f1f5f9;">
        <span style="font-family: monospace; font-size: 36px; font-weight: 800; color: #0f172a; letter-spacing: 8px;">${otp}</span>
      </div>
      <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 25px 0 0 0;">If you did not request this verification, you can safely ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 25px 0;" />
      <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">&copy; ${new Date().getFullYear()} MediChain. All rights reserved.</p>
    </div>
  `;
}

export function getPasswordResetEmailTemplate(name, otp) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #0891b2; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">MediChain</h1>
        <p style="color: #64748b; font-size: 12px; margin: 5px 0 0 0; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Secure Medical Registry</p>
      </div>
      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-bottom: 25px;" />
      <h2 style="color: #e11d48; font-size: 18px; font-weight: 700; margin-top: 0; margin-bottom: 10px;">Password recovery passcode</h2>
      <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">Hello <strong>${name}</strong>,</p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 25px 0;">We received a request to reset the password for your MediChain account. Please enter the following 6-digit passcode (OTP) to proceed with resetting your password. This passcode is valid for 15 minutes.</p>
      <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #fff1f2; border-radius: 16px; border: 1px solid #ffe4e6;">
        <span style="font-family: monospace; font-size: 36px; font-weight: 800; color: #9f1239; letter-spacing: 8px;">${otp}</span>
      </div>
      <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 25px 0 0 0;">If you did not request a password reset, please secure your account immediately or ignore this message.</p>
      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 25px 0;" />
      <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">&copy; ${new Date().getFullYear()} MediChain. All rights reserved.</p>
    </div>
  `;
}
