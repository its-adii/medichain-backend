// Helper function to return the common header and styles for premium emails
function getEmailHeader(title, accentColor = "#2563eb", accentLight = "#eff6ff") {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, a, p, h1, h2, h3 { font-family: Helvetica, Arial, sans-serif !important; }
  </style>
  <![endif]-->
  <style>
    /* Reset & Base Setup */
    body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    
    /* Responsive Styles */
    @media only screen and (max-width: 600px) {
      .main-container {
        width: 100% !important;
        max-width: 100% !important;
        border-radius: 0 !important;
        border-left: 0 !important;
        border-right: 0 !important;
      }
      .wrapper-bg {
        padding: 0 !important;
      }
      .header-cell {
        padding: 30px 20px !important;
      }
      .content-cell {
        padding: 30px 20px !important;
      }
      .footer-cell {
        padding: 30px 20px !important;
      }
      .responsive-block {
        display: block !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }
      .responsive-block-label {
        padding-bottom: 4px !important;
      }
      .responsive-block-value {
        padding-bottom: 16px !important;
      }
      .otp-text {
        font-size: 32px !important;
        letter-spacing: 6px !important;
      }
      .hide-mobile {
        display: none !important;
      }
      .btn {
        display: block !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; line-height: 1.6; -webkit-font-smoothing: antialiased;">
  <div class="wrapper-bg" style="background-color: #f4f7f6; padding: 40px 15px;">
    <!-- Main Email Container -->
    <table class="main-container" align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04); border: 1px solid #e5e7eb;">
      
      <!-- Brand Header -->
      <tr>
        <td class="header-cell" style="background-color: #ffffff; padding: 30px 40px; text-align: center; border-bottom: 1px solid #f3f4f6;">
          <h1 style="color: ${accentColor}; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">Medi<span style="color: #111827;">Chain</span></h1>
          <p style="color: #6b7280; font-size: 12px; margin: 4px 0 0 0; text-transform: uppercase; font-weight: 600; letter-spacing: 1.5px;">Premium Healthcare Network</p>
        </td>
      </tr>

      <!-- Hero Header (Optional Accent Bar) -->
      <tr>
        <td style="height: 4px; background: ${accentColor};"></td>
      </tr>

      <!-- Body Content -->
      <tr>
        <td class="content-cell" style="padding: 40px;">
  `;
}

function getEmailFooter() {
  return `
        </td>
      </tr>
      
      <!-- Footer -->
      <tr>
        <td class="footer-cell" style="background-color: #f9fafb; padding: 35px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="padding-bottom: 15px;">
                <h4 style="margin: 0; color: #111827; font-size: 16px; font-weight: 700; letter-spacing: -0.3px;">MediChain</h4>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom: 20px;">
                <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 0;">This email was sent from a notification-only address that cannot accept incoming email. Please do not reply to this message.</p>
              </td>
            </tr>
            <tr>
              <td style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} MediChain Healthcare. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `;
}

export function getVerificationEmailTemplate(name, otp) {
  return `
    ${getEmailHeader("Verify your email address", "#0ea5e9", "#e0f2fe")}
    
    <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin: 0 0 16px 0;">Verify your email address</h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi <strong>${name}</strong>,</p>
    <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">Thank you for registering with MediChain. To complete your setup and ensure the security of your account, please use the 6-digit verification code below. This code will expire in 15 minutes.</p>
    
    <!-- OTP Box -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 30px;">
      <tr>
        <td align="center" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px;">
          <span class="otp-text" style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 700; color: #0f172a; letter-spacing: 12px; display: inline-block; margin-left: 12px;">${otp}</span>
        </td>
      </tr>
    </table>
    
    <!-- Security Notice -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 0 8px 8px 0;">
          <p style="color: #92400e; font-size: 13px; margin: 0; line-height: 1.5;"><strong>Security Tip:</strong> Never share this code. MediChain staff will never ask for it.</p>
        </td>
      </tr>
    </table>
    
    <p style="color: #9ca3af; font-size: 13px; margin: 30px 0 0 0;">If you didn't request this email, you can safely ignore it.</p>
    ${getEmailFooter()}
  `;
}

export function getPasswordResetEmailTemplate(name, otp) {
  return `
    ${getEmailHeader("Reset your password", "#ef4444", "#fee2e2")}
    
    <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin: 0 0 16px 0;">Reset Your Password</h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi <strong>${name}</strong>,</p>
    <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">We received a request to reset your password. Enter the following 6-digit recovery code to regain access to your account. This code is valid for 15 minutes.</p>
    
    <!-- OTP Box -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 30px;">
      <tr>
        <td align="center" style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 25px;">
          <span class="otp-text" style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 700; color: #b91c1c; letter-spacing: 12px; display: inline-block; margin-left: 12px;">${otp}</span>
        </td>
      </tr>
    </table>
    
    <!-- Security Notice -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="background-color: #f9fafb; border-left: 4px solid #6b7280; padding: 16px; border-radius: 0 8px 8px 0;">
          <p style="color: #4b5563; font-size: 13px; margin: 0; line-height: 1.5;"><strong>Didn't request a reset?</strong> If you did not make this request, please contact support immediately to lock your account.</p>
        </td>
      </tr>
    </table>
    ${getEmailFooter()}
  `;
}

export function getWelcomeEmailTemplate(name, role) {
  const roleName = role ? role.charAt(0).toUpperCase() + role.slice(1) : "Member";
  return `
    ${getEmailHeader("Welcome to MediChain!", "#10b981", "#d1fae5")}
    
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="font-size: 48px; line-height: 1;">🎉</span>
    </div>
    
    <h2 style="color: #111827; font-size: 24px; font-weight: 800; margin: 0 0 16px 0; text-align: center;">Welcome to MediChain</h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; text-align: center;">Hi <strong>${name}</strong>,</p>
    <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0; text-align: center;">Your email is verified and your <strong>${roleName}</strong> account is fully active. You're now part of the most secure network for healthcare communication and records.</p>
    
    <!-- Quick Start Card -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 35px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
      <tr>
        <td style="padding: 24px;">
          <h3 style="color: #0f172a; font-size: 16px; font-weight: 700; margin: 0 0 16px 0;">What to do next:</h3>
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td width="24" valign="top" style="padding-bottom: 12px;"><span style="color: #10b981;">✓</span></td>
              <td style="padding-bottom: 12px; color: #475569; font-size: 14px;">Complete your profile details</td>
            </tr>
            <tr>
              <td width="24" valign="top" style="padding-bottom: 12px;"><span style="color: #10b981;">✓</span></td>
              <td style="padding-bottom: 12px; color: #475569; font-size: 14px;">Explore your secure dashboard</td>
            </tr>
            <tr>
              <td width="24" valign="top"><span style="color: #10b981;">✓</span></td>
              <td style="color: #475569; font-size: 14px;">Manage appointments effortlessly</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- Action Button -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <a href="https://medichain-frontend-rose.vercel.app/login" class="btn" style="background-color: #10b981; color: #ffffff; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: 600; display: inline-block;">Go to Dashboard</a>
        </td>
      </tr>
    </table>
    ${getEmailFooter()}
  `;
}

export function getAppointmentRequestTemplate(patientName, doctorName, date, time, reason) {
  return `
    ${getEmailHeader("Appointment Requested", "#f59e0b", "#fef3c7")}
    
    <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin: 0 0 16px 0;">Appointment Pending</h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">Hi <strong>${patientName}</strong>,</p>
    <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">Your appointment request with <strong>Dr. ${doctorName}</strong> has been sent to the clinic. It is currently pending confirmation. We will notify you once the doctor reviews it.</p>
    
    <!-- Details Table -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <tr>
        <td style="background-color: #f9fafb; padding: 16px 20px; border-bottom: 1px solid #e5e7eb;">
          <h3 style="margin: 0; color: #374151; font-size: 15px; font-weight: 600;">Booking Request Details</h3>
        </td>
      </tr>
      <tr>
        <td style="padding: 20px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px; color: #4b5563;">
            <tr>
              <td class="responsive-block responsive-block-label" width="120" style="padding-bottom: 12px; color: #6b7280; font-weight: 500;">Doctor</td>
              <td class="responsive-block responsive-block-value" style="padding-bottom: 12px; font-weight: 600; color: #111827;">Dr. ${doctorName}</td>
            </tr>
            <tr>
              <td class="responsive-block responsive-block-label" width="120" style="padding-bottom: 12px; color: #6b7280; font-weight: 500;">Date</td>
              <td class="responsive-block responsive-block-value" style="padding-bottom: 12px; font-weight: 600; color: #111827;">${date}</td>
            </tr>
            <tr>
              <td class="responsive-block responsive-block-label" width="120" style="padding-bottom: 12px; color: #6b7280; font-weight: 500;">Time</td>
              <td class="responsive-block responsive-block-value" style="padding-bottom: 12px; font-weight: 600; color: #111827;">${time}</td>
            </tr>
            <tr>
              <td class="responsive-block responsive-block-label" width="120" valign="top" style="color: #6b7280; font-weight: 500;">Reason</td>
              <td class="responsive-block responsive-block-value" valign="top" style="line-height: 1.5;">${reason}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ${getEmailFooter()}
  `;
}

export function getAppointmentConfirmedTemplate(patientName, doctorName, date, time) {
  return `
    ${getEmailHeader("Appointment Confirmed", "#10b981", "#d1fae5")}
    
    <div style="text-align: center; margin-bottom: 20px;">
      <span style="font-size: 40px; line-height: 1;">✅</span>
    </div>
    
    <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin: 0 0 16px 0; text-align: center;">Appointment Confirmed</h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">Hi <strong>${patientName}</strong>,</p>
    <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">Great news! Your appointment with <strong>Dr. ${doctorName}</strong> has been officially confirmed by the clinic.</p>
    
    <!-- Details Table -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <tr>
        <td style="background-color: #f9fafb; padding: 16px 20px; border-bottom: 1px solid #e5e7eb;">
          <h3 style="margin: 0; color: #374151; font-size: 15px; font-weight: 600;">Confirmed Details</h3>
        </td>
      </tr>
      <tr>
        <td style="padding: 20px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px; color: #4b5563;">
            <tr>
              <td class="responsive-block responsive-block-label" width="120" style="padding-bottom: 12px; color: #6b7280; font-weight: 500;">Doctor</td>
              <td class="responsive-block responsive-block-value" style="padding-bottom: 12px; font-weight: 600; color: #111827;">Dr. ${doctorName}</td>
            </tr>
            <tr>
              <td class="responsive-block responsive-block-label" width="120" style="padding-bottom: 12px; color: #6b7280; font-weight: 500;">Date</td>
              <td class="responsive-block responsive-block-value" style="padding-bottom: 12px; font-weight: 600; color: #111827;">${date}</td>
            </tr>
            <tr>
              <td class="responsive-block responsive-block-label" width="120" style="color: #6b7280; font-weight: 500;">Time</td>
              <td class="responsive-block responsive-block-value" style="font-weight: 600; color: #111827;">${time}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <p style="color: #6b7280; font-size: 14px; margin: 30px 0 0 0; text-align: center;">Please arrive 10-15 minutes prior to your scheduled time.</p>
    ${getEmailFooter()}
  `;
}

export function getAppointmentCancelledTemplate(recipientName, partnerName, role, date, time) {
  const partnerLabel = role === "doctor" ? `patient <strong>${partnerName}</strong>` : `Dr. <strong>${partnerName}</strong>`;
  return `
    ${getEmailHeader("Appointment Cancelled", "#ef4444", "#fee2e2")}
    
    <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin: 0 0 16px 0;">Appointment Cancellation</h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">Hi <strong>${recipientName}</strong>,</p>
    <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">Please note that the upcoming appointment on <strong>${date}</strong> at <strong>${time}</strong> has been cancelled by ${partnerLabel}.</p>
    
    <!-- Status Notice -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 0 8px 8px 0;">
          <p style="color: #991b1b; font-size: 14px; font-weight: 600; margin: 0 0 4px 0;">Status: Cancelled</p>
          <p style="color: #991b1b; font-size: 13px; margin: 0; line-height: 1.5;">You can easily book a new appointment or manage your schedule via your dashboard.</p>
        </td>
      </tr>
    </table>
    ${getEmailFooter()}
  `;
}

export function getConsultationCompletedTemplate(patientName, doctorName, date, time, clinicalNotes, prescriptions, labOrders) {
  let rxHtml = "";
  if (prescriptions && prescriptions.length > 0) {
    rxHtml = `
      <h3 style="color: #111827; font-size: 16px; font-weight: 700; margin: 30px 0 16px 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">💊 Prescriptions</h3>
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
        <thead>
          <tr>
            <th align="left" style="padding: 12px 10px; font-weight: 600; color: #4b5563; background-color: #f9fafb; border-radius: 6px 0 0 6px;">Medicine</th>
            <th align="left" style="padding: 12px 10px; font-weight: 600; color: #4b5563; background-color: #f9fafb;">Dosage</th>
            <th align="center" style="padding: 12px 10px; font-weight: 600; color: #4b5563; background-color: #f9fafb; border-radius: 0 6px 6px 0;">Duration</th>
          </tr>
        </thead>
        <tbody>
    `;
    prescriptions.forEach((p) => {
      rxHtml += `
        <tr>
          <td style="padding: 12px 10px; font-weight: 600; color: #111827; border-bottom: 1px solid #f3f4f6;">${p.medicineName}</td>
          <td style="padding: 12px 10px; color: #4b5563; border-bottom: 1px solid #f3f4f6;">${p.dosage}</td>
          <td align="center" style="padding: 12px 10px; color: #4b5563; border-bottom: 1px solid #f3f4f6;">${p.duration || "-"}</td>
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
      <h3 style="color: #111827; font-size: 16px; font-weight: 700; margin: 30px 0 16px 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">🔬 Lab Orders</h3>
      <ul style="margin: 0; padding: 0 0 0 20px; color: #4b5563; font-size: 14px; line-height: 1.8;">
    `;
    labOrders.forEach((l) => {
      labsHtml += `<li><strong>${l.testName}</strong></li>`;
    });
    labsHtml += `</ul>`;
  }

  return `
    ${getEmailHeader("Consultation Summary", "#3b82f6", "#eff6ff")}
    
    <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin: 0 0 16px 0;">Visit Summary Available</h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi <strong>${patientName}</strong>,</p>
    <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">Your consultation with <strong>Dr. ${doctorName}</strong> on ${date} is complete. Your records have been securely updated.</p>
    
    <h3 style="color: #111827; font-size: 16px; font-weight: 700; margin: 0 0 12px 0;">📝 Clinical Notes</h3>
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
          <p style="margin: 0; font-size: 14px; color: #374151; font-style: italic; line-height: 1.6;">${clinicalNotes ? clinicalNotes : "No specific clinical notes were recorded for this visit."}</p>
        </td>
      </tr>
    </table>

    ${rxHtml}
    ${labsHtml}

    <!-- Action Button -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 35px;">
      <tr>
        <td align="center">
          <a href="https://medichain-frontend-rose.vercel.app/login" class="btn" style="background-color: #3b82f6; color: #ffffff; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: 600; display: inline-block;">Access Full Vault</a>
        </td>
      </tr>
    </table>
    ${getEmailFooter()}
  `;
}

export function getDoctorAppointmentAlertTemplate(doctorName, patientName, date, time, reason) {
  return `
    ${getEmailHeader("New Appointment Alert", "#8b5cf6", "#f5f3ff")}
    
    <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin: 0 0 16px 0;">New Patient Booking</h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi <strong>Dr. ${doctorName}</strong>,</p>
    <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">A patient has requested a new appointment. Please review the details below to confirm or decline.</p>
    
    <!-- Details Table -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <tr>
        <td style="background-color: #f9fafb; padding: 16px 20px; border-bottom: 1px solid #e5e7eb;">
          <h3 style="margin: 0; color: #374151; font-size: 15px; font-weight: 600;">Booking Details</h3>
        </td>
      </tr>
      <tr>
        <td style="padding: 20px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px; color: #4b5563;">
            <tr>
              <td class="responsive-block responsive-block-label" width="100" style="padding-bottom: 12px; color: #6b7280; font-weight: 500;">Patient</td>
              <td class="responsive-block responsive-block-value" style="padding-bottom: 12px; font-weight: 600; color: #111827;">${patientName}</td>
            </tr>
            <tr>
              <td class="responsive-block responsive-block-label" width="100" style="padding-bottom: 12px; color: #6b7280; font-weight: 500;">Date</td>
              <td class="responsive-block responsive-block-value" style="padding-bottom: 12px; font-weight: 600; color: #111827;">${date}</td>
            </tr>
            <tr>
              <td class="responsive-block responsive-block-label" width="100" style="padding-bottom: 12px; color: #6b7280; font-weight: 500;">Time</td>
              <td class="responsive-block responsive-block-value" style="padding-bottom: 12px; font-weight: 600; color: #111827;">${time}</td>
            </tr>
            <tr>
              <td class="responsive-block responsive-block-label" width="100" valign="top" style="color: #6b7280; font-weight: 500;">Reason</td>
              <td class="responsive-block responsive-block-value" valign="top" style="line-height: 1.5;">${reason}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- Action Button -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 30px;">
      <tr>
        <td align="center">
          <a href="https://medichain-frontend-rose.vercel.app/login" class="btn" style="background-color: #8b5cf6; color: #ffffff; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: 600; display: inline-block;">Manage Bookings</a>
        </td>
      </tr>
    </table>
    ${getEmailFooter()}
  `;
}

export function getGenericStatusUpdateTemplate(patientName, doctorName, status, date, time) {
  const isConfirmed = status.toLowerCase() === "confirmed";
  const isCancelled = status.toLowerCase() === "cancelled";
  
  let accentColor = "#3b82f6";
  let noticeBg = "#eff6ff";
  let noticeBorder = "#bfdbfe";
  let noticeText = "#1e3a8a";
  
  if (isConfirmed) {
    accentColor = "#10b981";
    noticeBg = "#ecfdf5";
    noticeBorder = "#a7f3d0";
    noticeText = "#064e3b";
  } else if (isCancelled) {
    accentColor = "#ef4444";
    noticeBg = "#fef2f2";
    noticeBorder = "#fecaca";
    noticeText = "#991b1b";
  }

  return `
    ${getEmailHeader(`Appointment Update: ${status.toUpperCase()}`, accentColor, noticeBg)}
    
    <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin: 0 0 16px 0;">Status Update</h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">Hi <strong>${patientName}</strong>,</p>
    <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">Your appointment status with <strong>Dr. ${doctorName}</strong> has been updated.</p>
    
    <!-- Status Notice -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
      <tr>
        <td align="center" style="background-color: ${noticeBg}; border: 1px solid ${noticeBorder}; padding: 16px; border-radius: 8px;">
          <p style="color: ${noticeText}; font-size: 16px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 1px;">${status}</p>
        </td>
      </tr>
    </table>

    <!-- Details Table -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <tr>
        <td style="background-color: #f9fafb; padding: 16px 20px; border-bottom: 1px solid #e5e7eb;">
          <h3 style="margin: 0; color: #374151; font-size: 15px; font-weight: 600;">Appointment Details</h3>
        </td>
      </tr>
      <tr>
        <td style="padding: 20px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px; color: #4b5563;">
            <tr>
              <td class="responsive-block responsive-block-label" width="100" style="padding-bottom: 12px; color: #6b7280; font-weight: 500;">Doctor</td>
              <td class="responsive-block responsive-block-value" style="padding-bottom: 12px; font-weight: 600; color: #111827;">Dr. ${doctorName}</td>
            </tr>
            <tr>
              <td class="responsive-block responsive-block-label" width="100" style="padding-bottom: 12px; color: #6b7280; font-weight: 500;">Date</td>
              <td class="responsive-block responsive-block-value" style="padding-bottom: 12px; font-weight: 600; color: #111827;">${date}</td>
            </tr>
            <tr>
              <td class="responsive-block responsive-block-label" width="100" style="color: #6b7280; font-weight: 500;">Time</td>
              <td class="responsive-block responsive-block-value" style="font-weight: 600; color: #111827;">${time}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ${getEmailFooter()}
  `;
}
