// Helper function to return the common header and styles for premium emails
function getEmailHeader(title, accentColor = "#0891b2", gradientStart = "#06b6d4", gradientEnd = "#0891b2") {
  return `
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.03); }
          100% { transform: scale(1); }
        }
        @keyframes subtleSlide {
          from { transform: translateX(-5px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        .animated-card {
          animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animated-btn {
          transition: all 0.3s ease;
        }
        .animated-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(8, 145, 178, 0.3);
        }
        .pulse-element {
          animation: pulse 2s infinite ease-in-out;
        }
        
        @media only screen and (max-width: 600px) {
          .container {
            width: 100% !important;
            padding: 15px !important;
          }
          .otp-code {
            font-size: 28px !important;
            letter-spacing: 4px !important;
          }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
      <div style="background-color: #f8fafc; padding: 40px 20px;">
        <table class="container" align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; box-shadow: 0 10px 30px -10px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; overflow: hidden; border-collapse: collapse;">
          <!-- Top Gradient Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%); padding: 35px 40px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">MediChain</h1>
              <p style="color: rgba(255,255,255,0.85); font-size: 11px; margin: 6px 0 0 0; text-transform: uppercase; font-weight: 700; letter-spacing: 2px;">Decentralized & Secure Medical Registry</p>
            </td>
          </tr>
  `;
}

function getEmailFooter() {
  return `
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 0 0 10px 0;">Need support? Reply directly to this email or visit our help center.</p>
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">&copy; ${new Date().getFullYear()} MediChain Registry Corp. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </div>
    </body>
  `;
}

export function getVerificationEmailTemplate(name, otp) {
  return `
    ${getEmailHeader("Verify your email address", "#0891b2", "#06b6d4", "#0891b2")}
    <!-- Body Content -->
    <tr>
      <td class="animated-card" style="padding: 40px 40px 35px 40px;">
        <h2 style="color: #0f172a; font-size: 22px; font-weight: 700; margin: 0 0 12px 0;">Verify your email address</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">Hello <strong>${name}</strong>,</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">Thank you for registering with MediChain. To activate your account and start secure healthcare consultations, please verify your email by entering this 6-digit verification code. This code will expire in <strong>15 minutes</strong>.</p>
        
        <div style="text-align: center; margin: 30px 0; padding: 25px; background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
          <span class="otp-code pulse-element" style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; color: #0f172a; letter-spacing: 10px; display: inline-block;">${otp}</span>
        </div>
        
        <div style="background-color: #f0fdfa; border-left: 4px solid #0d9488; border-radius: 8px; padding: 16px; margin-bottom: 25px;">
          <p style="color: #0f766e; font-size: 13px; line-height: 1.5; margin: 0;"><strong>Security Reminder:</strong> Never share this code with anyone. MediChain staff will never ask for your verification code or password.</p>
        </div>
        
        <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 25px 0 0 0;">If you did not initiate this registration, you can safely disregard this email.</p>
      </td>
    </tr>
    ${getEmailFooter()}
  `;
}

export function getPasswordResetEmailTemplate(name, otp) {
  return `
    ${getEmailHeader("Password recovery passcode", "#e11d48", "#f43f5e", "#e11d48")}
    <!-- Body Content -->
    <tr>
      <td class="animated-card" style="padding: 40px 40px 35px 40px;">
        <h2 style="color: #0f172a; font-size: 22px; font-weight: 700; margin: 0 0 12px 0;">Reset your password</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">Hello <strong>${name}</strong>,</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">We received a request to reset your password for your MediChain account. Please use the following 6-digit verification code to complete the process. This code is valid for <strong>15 minutes</strong>.</p>
        
        <div style="text-align: center; margin: 30px 0; padding: 25px; background: linear-gradient(180deg, #fff5f5 0%, #ffe3e3 100%); border-radius: 20px; border: 1px solid #ffd4d4; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
          <span class="otp-code pulse-element" style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; color: #b91c1c; letter-spacing: 10px; display: inline-block;">${otp}</span>
        </div>
        
        <div style="background-color: #fff1f2; border-left: 4px solid #e11d48; border-radius: 8px; padding: 16px; margin-bottom: 25px;">
          <p style="color: #9f1239; font-size: 13px; line-height: 1.5; margin: 0;"><strong>Didn't request this?</strong> If you did not request a password reset, please change your security settings or contact support immediately to lock your account.</p>
        </div>
      </td>
    </tr>
    ${getEmailFooter()}
  `;
}

export function getWelcomeEmailTemplate(name, role) {
  const roleName = role ? role.charAt(0).toUpperCase() + role.slice(1) : "Member";
  return `
    ${getEmailHeader("Welcome to MediChain!", "#0891b2", "#06b6d4", "#0891b2")}
    <!-- Body Content -->
    <tr>
      <td class="animated-card" style="padding: 40px 40px 35px 40px;">
        <div style="text-align: center; margin-bottom: 25px;">
          <span style="font-size: 48px;">🎉</span>
        </div>
        <h2 style="color: #0f172a; font-size: 24px; font-weight: 800; margin: 0 0 12px 0; text-align: center; color: #0891b2;">Welcome to MediChain!</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">Hello <strong>${name}</strong>,</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">Your email address has been successfully verified, and your <strong>${roleName}</strong> account is fully activated. You are now part of a secure, modern network designed to protect medical records and streamline healthcare communications.</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin-bottom: 30px;">
          <h3 style="color: #0f172a; font-size: 14px; font-weight: 700; margin: 0 0 12px 0;">Here's what you can do right now:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 13.5px; line-height: 1.7;">
            <li style="margin-bottom: 6px;">Update your user details and medical specializations (for doctors)</li>
            <li style="margin-bottom: 6px;">Manage, book, and track appointments in real-time</li>
            <li style="margin-bottom: 6px;">Access your secure healthcare data vault with full privacy control</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:5173/login" class="animated-btn" style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: #ffffff; padding: 14px 32px; border-radius: 14px; text-decoration: none; font-size: 14.5px; font-weight: 700; display: inline-block; box-shadow: 0 5px 15px rgba(8, 145, 178, 0.2);">Access Dashboard</a>
        </div>
      </td>
    </tr>
    ${getEmailFooter()}
  `;
}

export function getAppointmentRequestTemplate(patientName, doctorName, date, time, reason) {
  return `
    ${getEmailHeader("Appointment Request Received", "#d97706", "#f59e0b", "#d97706")}
    <!-- Body Content -->
    <tr>
      <td class="animated-card" style="padding: 40px 40px 35px 40px;">
        <h2 style="color: #0f172a; font-size: 22px; font-weight: 700; margin: 0 0 12px 0;">Appointment Pending Confirmation</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">Hello <strong>${patientName}</strong>,</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">Your appointment request with <strong>Dr. ${doctorName}</strong> has been received. The appointment is currently pending confirmation from the clinic. We will notify you once it's confirmed.</p>
        
        <div style="background: linear-gradient(180deg, #fefdf0 0%, #fef3c7 100%); border: 1px solid #fde68a; border-radius: 20px; padding: 25px; margin-bottom: 25px;">
          <h3 style="color: #92400e; font-size: 15px; font-weight: 700; margin: 0 0 15px 0; border-bottom: 1px solid rgba(217, 119, 6, 0.15); padding-bottom: 10px;">Booking Details</h3>
          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 14px; color: #451a03;">
            <tr>
              <td style="padding: 6px 0; font-weight: 600;" width="100">Doctor:</td>
              <td style="padding: 6px 0;">Dr. ${doctorName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600;">Date:</td>
              <td style="padding: 6px 0;">${date}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600;">Time:</td>
              <td style="padding: 6px 0;">${time}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; vertical-align: top;">Reason:</td>
              <td style="padding: 6px 0; line-height: 1.4;">${reason}</td>
            </tr>
          </table>
        </div>
      </td>
    </tr>
    ${getEmailFooter()}
  `;
}

export function getAppointmentConfirmedTemplate(patientName, doctorName, date, time) {
  return `
    ${getEmailHeader("Appointment Confirmed!", "#059669", "#10b981", "#059669")}
    <!-- Body Content -->
    <tr>
      <td class="animated-card" style="padding: 40px 40px 35px 40px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <span style="font-size: 42px;">📅</span>
        </div>
        <h2 style="color: #0f172a; font-size: 22px; font-weight: 700; margin: 0 0 12px 0; text-align: center; color: #059669;">Your Appointment is Confirmed</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">Hello <strong>${patientName}</strong>,</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">Great news! Your booking request with <strong>Dr. ${doctorName}</strong> has been officially confirmed. Please review the appointment details below.</p>
        
        <div style="background: linear-gradient(180deg, #ecfdf5 0%, #d1fae5 100%); border: 1px solid #a7f3d0; border-radius: 20px; padding: 25px; margin-bottom: 25px;">
          <h3 style="color: #065f46; font-size: 15px; font-weight: 700; margin: 0 0 15px 0; border-bottom: 1px solid rgba(5, 150, 105, 0.15); padding-bottom: 10px;">Appointment Summary</h3>
          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 14px; color: #064e3b;">
            <tr>
              <td style="padding: 6px 0; font-weight: 600;" width="100">Doctor:</td>
              <td style="padding: 6px 0;">Dr. ${doctorName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600;">Date:</td>
              <td style="padding: 6px 0;">${date}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600;">Time:</td>
              <td style="padding: 6px 0;">${time}</td>
            </tr>
          </table>
        </div>
        
        <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 25px 0 0 0; text-align: center;">Please arrive 10 minutes prior to your scheduled slot. Log into your dashboard to reschedule if necessary.</p>
      </td>
    </tr>
    ${getEmailFooter()}
  `;
}

export function getAppointmentCancelledTemplate(recipientName, partnerName, role, date, time) {
  const partnerLabel = role === "doctor" ? `patient <strong>${partnerName}</strong>` : `Dr. <strong>${partnerName}</strong>`;
  return `
    ${getEmailHeader("Appointment Cancelled", "#e11d48", "#f43f5e", "#e11d48")}
    <!-- Body Content -->
    <tr>
      <td class="animated-card" style="padding: 40px 40px 35px 40px;">
        <h2 style="color: #0f172a; font-size: 22px; font-weight: 700; margin: 0 0 12px 0;">Appointment Cancellation Alert</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">Hello <strong>${recipientName}</strong>,</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">Please note that the upcoming appointment on <strong>${date}</strong> at <strong>${time}</strong> has been cancelled by ${partnerLabel}.</p>
        
        <div style="background-color: #fff5f5; border: 1px solid #fed7d7; border-radius: 16px; padding: 20px; margin-bottom: 25px;">
          <p style="margin: 0; color: #c53030; font-size: 14px; font-weight: 600;">Status: Cancelled</p>
          <p style="margin: 5px 0 0 0; color: #742a2a; font-size: 13.5px; line-height: 1.4;">If this cancellation was unintended, or you would like to book a new appointment, you can do so through the MediChain patient portal.</p>
        </div>
      </td>
    </tr>
    ${getEmailFooter()}
  `;
}

export function getConsultationCompletedTemplate(patientName, doctorName, date, time, clinicalNotes, prescriptions, labOrders) {
  let rxHtml = "";
  if (prescriptions && prescriptions.length > 0) {
    rxHtml = `
      <h3 style="color: #0f172a; font-size: 15px; font-weight: 700; margin: 25px 0 12px 0;">💊 Rx Prescription</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13.5px;">
        <thead>
          <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0; text-align: left;">
            <th style="padding: 12px 10px; font-weight: 700; color: #475569;">Medicine Name</th>
            <th style="padding: 12px 10px; font-weight: 700; color: #475569;">Dosage & Frequency</th>
            <th style="padding: 12px 10px; font-weight: 700; color: #475569;">Duration</th>
            <th style="padding: 12px 10px; font-weight: 700; color: #475569; text-align: center;">Refill</th>
          </tr>
        </thead>
        <tbody>
    `;
    prescriptions.forEach((p) => {
      rxHtml += `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 10px; font-weight: 600; color: #0f172a;">${p.medicineName}</td>
          <td style="padding: 12px 10px; color: #334155;">${p.dosage}</td>
          <td style="padding: 12px 10px; color: #334155;">${p.duration || "N/A"}</td>
          <td style="padding: 12px 10px; text-align: center; color: #334155;">${p.refillable ? "Yes" : "No"}</td>
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
      <h3 style="color: #0f172a; font-size: 15px; font-weight: 700; margin: 25px 0 12px 0;">🔬 Lab Orders</h3>
      <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 14px; line-height: 1.6; margin-bottom: 25px;">
    `;
    labOrders.forEach((l) => {
      labsHtml += `<li style="margin-bottom: 6px;"><strong>${l.testName}</strong></li>`;
    });
    labsHtml += `</ul>`;
  }

  return `
    ${getEmailHeader("Consultation Summary", "#0891b2", "#06b6d4", "#0891b2")}
    <!-- Body Content -->
    <tr>
      <td class="animated-card" style="padding: 40px 40px 35px 40px;">
        <h2 style="color: #0f172a; font-size: 22px; font-weight: 700; margin: 0 0 12px 0; color: #0891b2;">Consultation Visit Summary</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">Hello <strong>${patientName}</strong>,</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">Your medical consultation with <strong>Dr. ${doctorName}</strong> has been completed. The records and prescription summary have been saved securely to your dashboard.</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px; margin-bottom: 25px; font-size: 13.5px;">
          <table width="100%">
            <tr><td style="color: #64748b; font-weight: 600;" width="80">Doctor:</td><td style="color: #334155;">Dr. ${doctorName}</td></tr>
            <tr><td style="color: #64748b; font-weight: 600;">Date:</td><td style="color: #334155;">${date}</td></tr>
            <tr><td style="color: #64748b; font-weight: 600;">Time:</td><td style="color: #334155;">${time}</td></tr>
          </table>
        </div>

        <h3 style="color: #0f172a; font-size: 15px; font-weight: 700; margin: 20px 0 10px 0;">📝 Clinical Notes</h3>
        <div style="background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border: 1px solid #e9d5ff; border-radius: 16px; padding: 20px; font-size: 14px; color: #581c87; font-style: italic; line-height: 1.6; margin-bottom: 25px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.01);">
          ${clinicalNotes || "No clinical findings recorded."}
        </div>

        ${rxHtml}
        ${labsHtml}

        <div style="text-align: center; margin: 30px 0 10px 0;">
          <a href="http://localhost:5173/login" class="animated-btn" style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: #ffffff; padding: 14px 32px; border-radius: 14px; text-decoration: none; font-size: 14.5px; font-weight: 700; display: inline-block; box-shadow: 0 5px 15px rgba(8, 145, 178, 0.25);">View Records in Vault</a>
        </div>
      </td>
    </tr>
    ${getEmailFooter()}
  `;
}

export function getDoctorAppointmentAlertTemplate(doctorName, patientName, date, time, reason) {
  return `
    ${getEmailHeader("New Appointment Alert", "#4f46e5", "#6366f1", "#4f46e5")}
    <!-- Body Content -->
    <tr>
      <td class="animated-card" style="padding: 40px 40px 35px 40px;">
        <h2 style="color: #0f172a; font-size: 22px; font-weight: 700; margin: 0 0 12px 0; color: #4f46e5;">New Booking Request Received</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">Hello <strong>Dr. ${doctorName}</strong>,</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">A new patient appointment request has been scheduled in your system. Please review the patient and scheduling details below to confirm the appointment.</p>
        
        <div style="background: linear-gradient(180deg, #f5f3ff 0%, #ede9fe 100%); border: 1px solid #ddd6fe; border-radius: 20px; padding: 25px; margin-bottom: 25px;">
          <h3 style="color: #5b21b6; font-size: 15px; font-weight: 700; margin: 0 0 15px 0; border-bottom: 1px solid rgba(79, 70, 229, 0.15); padding-bottom: 10px;">Patient Appointment Details</h3>
          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 14px; color: #2e1065;">
            <tr>
              <td style="padding: 6px 0; font-weight: 600;" width="100">Patient:</td>
              <td style="padding: 6px 0;">${patientName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600;">Date:</td>
              <td style="padding: 6px 0;">${date}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600;">Time:</td>
              <td style="padding: 6px 0;">${time}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; vertical-align: top;">Reason:</td>
              <td style="padding: 6px 0; line-height: 1.4;">${reason}</td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:5173/login" class="animated-btn" style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff; padding: 14px 32px; border-radius: 14px; text-decoration: none; font-size: 14.5px; font-weight: 700; display: inline-block; box-shadow: 0 5px 15px rgba(79, 70, 229, 0.25);">Manage Booking</a>
        </div>
      </td>
    </tr>
    ${getEmailFooter()}
  `;
}

export function getGenericStatusUpdateTemplate(patientName, doctorName, status, date, time) {
  const isConfirmed = status.toLowerCase() === "confirmed";
  const isCancelled = status.toLowerCase() === "cancelled";
  
  let accentColor = "#0891b2";
  let themeBg = "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)";
  let themeBorder = "#e2e8f0";
  let textColor = "#334155";
  
  if (isConfirmed) {
    accentColor = "#059669";
    themeBg = "linear-gradient(180deg, #ecfdf5 0%, #d1fae5 100%)";
    themeBorder = "#a7f3d0";
    textColor = "#064e3b";
  } else if (isCancelled) {
    accentColor = "#e11d48";
    themeBg = "linear-gradient(180deg, #fff5f5 0%, #ffe3e3 100%)";
    themeBorder = "#fed7d7";
    textColor = "#742a2a";
  }

  return `
    ${getEmailHeader(`Appointment Update: ${status}`, accentColor, accentColor, accentColor)}
    <!-- Body Content -->
    <tr>
      <td class="animated-card" style="padding: 40px 40px 35px 40px;">
        <h2 style="color: #0f172a; font-size: 22px; font-weight: 700; margin: 0 0 12px 0;">Appointment Status Update</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">Hello <strong>${patientName}</strong>,</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">Your appointment status with <strong>Dr. ${doctorName}</strong> has been updated to <strong>${status.toUpperCase()}</strong>.</p>
        
        <div style="background: ${themeBg}; border: 1px solid ${themeBorder}; border-radius: 20px; padding: 25px; margin-bottom: 25px;">
          <h3 style="color: ${accentColor}; font-size: 15px; font-weight: 700; margin: 0 0 15px 0; border-bottom: 1px solid ${themeBorder}; padding-bottom: 10px;">Details</h3>
          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 14px; color: ${textColor};">
            <tr>
              <td style="padding: 6px 0; font-weight: 600;" width="100">Doctor:</td>
              <td style="padding: 6px 0;">Dr. ${doctorName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600;">Date:</td>
              <td style="padding: 6px 0;">${date}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600;">Time:</td>
              <td style="padding: 6px 0;">${time}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600;">Status:</td>
              <td style="padding: 6px 0; font-weight: 700; text-transform: uppercase;">${status}</td>
            </tr>
          </table>
        </div>
      </td>
    </tr>
    ${getEmailFooter()}
  `;
}
