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

export function getWelcomeEmailTemplate(name, role) {
  const roleName = role ? role.charAt(0).toUpperCase() + role.slice(1) : "User";
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #0891b2; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">MediChain</h1>
        <p style="color: #64748b; font-size: 12px; margin: 5px 0 0 0; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Secure Medical Registry</p>
      </div>
      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-bottom: 25px;" />
      <h2 style="color: #0891b2; font-size: 18px; font-weight: 700; margin-top: 0; margin-bottom: 10px;">Welcome to MediChain!</h2>
      <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">Hello <strong>${name}</strong>,</p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 25px 0;">Your email address has been successfully verified, and your <strong>${roleName}</strong> account is fully activated.</p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 25px 0;">You can now access your secure medical registry dashboard to manage profile settings, appointments, and secure health data vaults.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:5173/login" style="background-color: #0891b2; color: #ffffff; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-size: 14px; font-weight: 700; display: inline-block;">Go to Dashboard</a>
      </div>
      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 25px 0;" />
      <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">&copy; ${new Date().getFullYear()} MediChain. All rights reserved.</p>
    </div>
  `;
}

export function getAppointmentRequestTemplate(patientName, doctorName, date, time, reason) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #0891b2; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">MediChain</h1>
        <p style="color: #64748b; font-size: 12px; margin: 5px 0 0 0; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Secure Medical Registry</p>
      </div>
      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-bottom: 25px;" />
      <h2 style="color: #d97706; font-size: 18px; font-weight: 700; margin-top: 0; margin-bottom: 10px;">Appointment Request Received</h2>
      <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">Hello <strong>${patientName}</strong>,</p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 25px 0;">Your appointment request with <strong>Dr. ${doctorName}</strong> has been received and is currently <strong>pending confirmation</strong> by the doctor.</p>
      <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 16px; padding: 20px; margin-bottom: 25px;">
        <p style="margin: 0 0 10px 0; color: #334155; font-size: 14px;"><strong>Doctor:</strong> Dr. ${doctorName}</p>
        <p style="margin: 0 0 10px 0; color: #334155; font-size: 14px;"><strong>Date:</strong> ${date}</p>
        <p style="margin: 0 0 10px 0; color: #334155; font-size: 14px;"><strong>Time:</strong> ${time}</p>
        <p style="margin: 0; color: #334155; font-size: 14px;"><strong>Reason:</strong> ${reason}</p>
      </div>
      <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 25px 0 0 0;">You will receive another email notification once the doctor reviews and updates the status of your appointment.</p>
      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 25px 0;" />
      <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">&copy; ${new Date().getFullYear()} MediChain. All rights reserved.</p>
    </div>
  `;
}

export function getAppointmentConfirmedTemplate(patientName, doctorName, date, time) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #0891b2; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">MediChain</h1>
        <p style="color: #64748b; font-size: 12px; margin: 5px 0 0 0; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Secure Medical Registry</p>
      </div>
      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-bottom: 25px;" />
      <h2 style="color: #0891b2; font-size: 18px; font-weight: 700; margin-top: 0; margin-bottom: 10px;">Appointment Confirmed!</h2>
      <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">Hello <strong>${patientName}</strong>,</p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 25px 0;">Great news! Your appointment with <strong>Dr. ${doctorName}</strong> has been <strong>confirmed</strong>.</p>
      <div style="background-color: #f0fdf4; border: 1px solid #dcfce7; border-radius: 16px; padding: 20px; margin-bottom: 25px;">
        <p style="margin: 0 0 10px 0; color: #15803d; font-size: 14px;"><strong>Doctor:</strong> Dr. ${doctorName}</p>
        <p style="margin: 0 0 10px 0; color: #15803d; font-size: 14px;"><strong>Date:</strong> ${date}</p>
        <p style="margin: 0; color: #15803d; font-size: 14px;"><strong>Time:</strong> ${time}</p>
      </div>
      <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 25px 0 0 0;">Please log into your patient dashboard if you need to reschedule or view instructions before your visit.</p>
      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 25px 0;" />
      <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">&copy; ${new Date().getFullYear()} MediChain. All rights reserved.</p>
    </div>
  `;
}

export function getAppointmentCancelledTemplate(recipientName, partnerName, role, date, time) {
  const partnerLabel = role === "doctor" ? `patient <strong>${partnerName}</strong>` : `Dr. <strong>${partnerName}</strong>`;
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #0891b2; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">MediChain</h1>
        <p style="color: #64748b; font-size: 12px; margin: 5px 0 0 0; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Secure Medical Registry</p>
      </div>
      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-bottom: 25px;" />
      <h2 style="color: #e11d48; font-size: 18px; font-weight: 700; margin-top: 0; margin-bottom: 10px;">Appointment Cancelled</h2>
      <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">Hello <strong>${recipientName}</strong>,</p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 25px 0;">Please be informed that the appointment scheduled on <strong>${date}</strong> at <strong>${time}</strong> has been <strong>cancelled</strong> by ${partnerLabel}.</p>
      <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 25px 0 0 0;">If you need to book a new appointment, you can do so by signing into your MediChain account.</p>
      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 25px 0;" />
      <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">&copy; ${new Date().getFullYear()} MediChain. All rights reserved.</p>
    </div>
  `;
}

export function getConsultationCompletedTemplate(patientName, doctorName, date, time, clinicalNotes, prescriptions, labOrders) {
  let rxHtml = "";
  if (prescriptions && prescriptions.length > 0) {
    rxHtml = `
      <h3 style="color: #0f172a; font-size: 15px; font-weight: 700; margin-top: 20px; margin-bottom: 10px;">Rx Medications</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
        <thead>
          <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0; text-align: left;">
            <th style="padding: 10px; font-weight: 750; color: #475569;">Medicine Name</th>
            <th style="padding: 10px; font-weight: 750; color: #475569;">Dosage Frequency</th>
            <th style="padding: 10px; font-weight: 750; color: #475569;">Duration</th>
            <th style="padding: 10px; font-weight: 750; color: #475569; text-align: center;">Refill</th>
          </tr>
        </thead>
        <tbody>
    `;
    prescriptions.forEach((p) => {
      rxHtml += `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px; font-weight: 600; color: #0f172a;">${p.medicineName}</td>
          <td style="padding: 10px; color: #334155;">${p.dosage}</td>
          <td style="padding: 10px; color: #334155;">${p.duration || "N/A"}</td>
          <td style="padding: 10px; text-align: center; color: #334155;">${p.refillable ? "Yes" : "No"}</td>
        </tr>
      `;
    });
    rxHtml += `
        </tbody>
      </table>
    `;
  }

  let labsHtml = "";
  if (labOrders && labOrders.length > 0) {
    labsHtml = `
      <h3 style="color: #0f172a; font-size: 15px; font-weight: 700; margin-top: 20px; margin-bottom: 10px;">Diagnostic Lab Tests Ordered</h3>
      <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 13px; line-height: 1.6;">
    `;
    labOrders.forEach((l) => {
      labsHtml += `<li style="margin-bottom: 5px;"><strong>${l.testName}</strong></li>`;
    });
    labsHtml += `</ul>`;
  }

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #0891b2; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">MediChain</h1>
        <p style="color: #64748b; font-size: 12px; margin: 5px 0 0 0; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Secure Medical Registry</p>
      </div>
      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-bottom: 25px;" />
      <h2 style="color: #0891b2; font-size: 18px; font-weight: 700; margin-top: 0; margin-bottom: 10px;">Consultation Summary</h2>
      <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">Hello <strong>${patientName}</strong>,</p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 25px 0;">Your consultation with <strong>Dr. ${doctorName}</strong> has been successfully completed. Here are the clinical details and instructions from your visit.</p>
      
      <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 16px; padding: 20px; margin-bottom: 20px; font-size: 13px;">
        <p style="margin: 0 0 8px 0; color: #475569;"><strong>Doctor:</strong> Dr. ${doctorName}</p>
        <p style="margin: 0 0 8px 0; color: #475569;"><strong>Date:</strong> ${date}</p>
        <p style="margin: 0; color: #475569;"><strong>Time:</strong> ${time}</p>
      </div>

      <h3 style="color: #0f172a; font-size: 15px; font-weight: 700; margin-top: 20px; margin-bottom: 10px;">Clinical Notes & Findings</h3>
      <div style="background-color: #faf5ff; border: 1px solid #f3e8ff; border-radius: 16px; padding: 20px; font-size: 13px; color: #581c87; font-style: italic; line-height: 1.6; margin-bottom: 20px;">
        ${clinicalNotes || "No notes recorded."}
      </div>

      ${rxHtml}
      ${labsHtml}

      <div style="text-align: center; margin: 30px 0 10px 0;">
        <a href="http://localhost:5173/login" style="background-color: #0891b2; color: #ffffff; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-size: 14px; font-weight: 700; display: inline-block;">View Secure Records Vault</a>
      </div>
      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 25px 0;" />
      <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">&copy; ${new Date().getFullYear()} MediChain. All rights reserved.</p>
    </div>
  `;
}

