import appointmentModel from "../models/appointment.model.js";
import doctorModel from "../models/doctor.model.js";
import userModel from "../models/user.model.js";
import { sendEmail } from "../services/email.service.js";
import {
  getAppointmentRequestTemplate,
  getAppointmentConfirmedTemplate,
  getAppointmentCancelledTemplate,
  getConsultationCompletedTemplate
} from "../services/emailTemplates.js";

export async function bookAppointment(req, res) {
  try {
    const { doctorId, date, time, reason, patientId } = req.body;

    const doctor = await doctorModel.findById(doctorId).populate("user", "name email");

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    // Admin can specify a patient; otherwise use the logged-in user
    const appointmentPatientId = (req.user.role === "admin" && patientId) ? patientId : req.user._id;

    const patientUser = await userModel.findById(appointmentPatientId);
    if (!patientUser) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    const appointment = await appointmentModel.create({
      patient: appointmentPatientId,
      doctor: doctorId,
      date,
      time,
      reason,
    });

    const io = req.app.get("io");
    const users = req.app.get("users");
    const doctorSocketId = users.get(doctor.user._id.toString());
    if (doctorSocketId) {
      io.to(doctorSocketId).emit("appointmentBooked", {
        message: `New appointment booked by ${req.user.name} for ${date} at ${time}`,
        appointment
      });
    }

    if (io) {
      io.emit("appointmentsUpdated");
    }

    // Send Emails
    const formattedDate = date && !isNaN(new Date(date).getTime())
      ? new Date(date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : date || "N/A";

    // 1. Patient Pending Request Email
    await sendEmail({
      to: patientUser.email,
      subject: "Appointment Requested (Pending) - MediChain",
      html: getAppointmentRequestTemplate(
        patientUser.name,
        doctor.user ? doctor.user.name : "Cardiologist",
        formattedDate,
        time,
        reason
      )
    });

    // 2. Doctor Alert
    if (doctor.user && doctor.user.email) {
      await sendEmail({
        to: doctor.user.email,
        subject: "New Appointment Booked - MediChain",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #0891b2; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">MediChain</h1>
              <p style="color: #64748b; font-size: 12px; margin: 5px 0 0 0; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Secure Medical Registry</p>
            </div>
            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-bottom: 25px;" />
            <h2 style="color: #0891b2; font-size: 18px; font-weight: 700; margin-top: 0; margin-bottom: 10px;">New Appointment Booked</h2>
            <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">Hello <strong>Dr. ${doctor.user.name}</strong>,</p>
            <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 25px 0;">A new appointment has been scheduled with you by patient <strong>${req.user.name}</strong>.</p>
            <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 16px; padding: 20px; margin-bottom: 25px;">
              <p style="margin: 0 0 10px 0; color: #334155; font-size: 14px;"><strong>Patient:</strong> ${req.user.name}</p>
              <p style="margin: 0 0 10px 0; color: #334155; font-size: 14px;"><strong>Date:</strong> ${formattedDate}</p>
              <p style="margin: 0 0 10px 0; color: #334155; font-size: 14px;"><strong>Time:</strong> ${time}</p>
              <p style="margin: 0; color: #334155; font-size: 14px;"><strong>Reason:</strong> ${reason}</p>
            </div>
            <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 25px 0 0 0;">Please review and update the status of this booking in your doctor dashboard.</p>
            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 25px 0;" />
            <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">&copy; ${new Date().getFullYear()} MediChain. All rights reserved.</p>
          </div>
        `
      });
    }

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function getMyAppointments(req, res) {
  try {
    const appointments = await appointmentModel
      .find({ patient: req.user._id })
      .populate("doctor")
      .populate("patient", "name email age gender bloodGroup weight profileImage");

    res.status(200).json({
      message: "Appointments fetched successfully",
      appointments,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function getDoctorAppointments(req, res) {
  try {
    const doctor = await doctorModel.findOne({ user: req.user._id });

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }

    const appointments = await appointmentModel
      .find({ doctor: doctor._id })
      .populate("patient", "name email age gender bloodGroup weight profileImage");

    res.status(200).json({
      message: "Appointments fetched successfully",
      appointments,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function updateAppointmentStatus(req, res) {
  try {
    const { status, clinicalNotes, prescriptions, labOrders } = req.body;
    const appointmentId = req.params.id;

    const appointment = await appointmentModel.findById(appointmentId)
      .populate("patient", "name email age gender bloodGroup weight profileImage")
      .populate({ path: "doctor", populate: { path: "user", select: "name email" } });

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    // Role-based restrictions
    if (req.user.role === "patient") {
      if (status !== "cancelled") {
        return res.status(403).json({
          message: "Patients are only allowed to cancel appointments",
        });
      }
      if (appointment.patient._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message: "You can only cancel your own appointments",
        });
      }
    }

    if (clinicalNotes !== undefined || prescriptions !== undefined || labOrders !== undefined) {
      if (req.user.role !== "doctor" && req.user.role !== "admin") {
        return res.status(403).json({
          message: "Only doctors and admins can modify clinical records",
        });
      }
      if (clinicalNotes !== undefined) appointment.clinicalNotes = clinicalNotes;
      if (prescriptions !== undefined) appointment.prescriptions = prescriptions;
      if (labOrders !== undefined) appointment.labOrders = labOrders;
    }

    if (status !== undefined) {
      appointment.status = status;
    }
    
    await appointment.save();
    const io = req.app.get("io");
    const users = req.app.get("users");

    // Realtime Socket.io and Email Notifications
    if (io) {
      io.emit("appointmentsUpdated");
    }

    if (req.user.role === "patient") {
      const doctor = await doctorModel.findById(appointment.doctor).populate("user", "name email");
      if (doctor && doctor.user) {
        const doctorUserId = doctor.user._id?.toString();
        const doctorSocketId = (users && doctorUserId) ? users.get(doctorUserId) : null;
        const formattedDate = appointment.date ? new Date(appointment.date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric"
        }) : "N/A";
        const message = `Appointment on ${formattedDate} was cancelled by patient ${req.user.name || "Patient"}`;

        if (io && doctorSocketId) {
          io.to(doctorSocketId).emit("appointmentStatusChanged", {
            message,
            appointment
          });
        }

        // Email Alert to Doctor
        if (doctor.user.email) {
          await sendEmail({
            to: doctor.user.email,
            subject: "Appointment Cancelled by Patient - MediChain",
            html: getAppointmentCancelledTemplate(
              doctor.user.name,
              req.user.name || "Patient",
              "patient",
              formattedDate,
              appointment.time
            )
          });
        }

        // Email Alert to Patient (Self Confirmation)
        if (req.user.email) {
          await sendEmail({
            to: req.user.email,
            subject: "Appointment Cancelled - MediChain",
            html: getAppointmentCancelledTemplate(
              req.user.name || "Patient",
              doctor.user.name,
              "doctor",
              formattedDate,
              appointment.time
            )
          });
        }
      }
    } else {
      if (appointment.patient) {
        const patientUserId = appointment.patient._id?.toString();
        const patientSocketId = (users && patientUserId) ? users.get(patientUserId) : null;
        const currentStatus = appointment.status || "pending";
        const message = `Your appointment status was updated to '${currentStatus}'`;

        if (io && patientSocketId) {
          io.to(patientSocketId).emit("appointmentStatusChanged", {
            message,
            appointment
          });
        }

        // Email Alert to Patient
        if (appointment.patient.email) {
          const doctorName = appointment.doctor?.user?.name || "your doctor";
          const formattedDate = appointment.date ? new Date(appointment.date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
          }) : "N/A";

          let subject = `Appointment Status Update: ${currentStatus.toUpperCase()} - MediChain`;
          let htmlContent = "";

          if (currentStatus === "confirmed") {
            subject = "Appointment Confirmed - MediChain";
            htmlContent = getAppointmentConfirmedTemplate(
              appointment.patient.name,
              doctorName,
              formattedDate,
              appointment.time
            );
          } else if (currentStatus === "cancelled") {
            subject = "Appointment Cancelled - MediChain";
            htmlContent = getAppointmentCancelledTemplate(
              appointment.patient.name,
              doctorName,
              "doctor",
              formattedDate,
              appointment.time
            );
          } else if (currentStatus === "completed") {
            subject = "Consultation Summary & Prescription - MediChain";
            htmlContent = getConsultationCompletedTemplate(
              appointment.patient.name,
              doctorName,
              formattedDate,
              appointment.time,
              appointment.clinicalNotes,
              appointment.prescriptions,
              appointment.labOrders
            );
          } else {
            // Fallback generic status update template
            htmlContent = `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <h1 style="color: #0891b2; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">MediChain</h1>
                  <p style="color: #64748b; font-size: 12px; margin: 5px 0 0 0; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Secure Medical Registry</p>
                </div>
                <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-bottom: 25px;" />
                <h2 style="color: #0891b2; font-size: 18px; font-weight: 700; margin-top: 0; margin-bottom: 10px;">Appointment Status Update</h2>
                <p>Hello <strong>${appointment.patient.name || ""}</strong>,</p>
                <p>Your appointment with <strong>Dr. ${doctorName}</strong> has been updated to <strong>${currentStatus.toUpperCase()}</strong>.</p>
                <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Time:</strong> ${appointment.time || "N/A"}</p>
                <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
                <p style="font-size: 12px; color: #64748b;">Please sign into your MediChain dashboard to view your schedule details.</p>
              </div>
            `;
          }

          await sendEmail({
            to: appointment.patient.email,
            subject,
            html: htmlContent
          });
        }

        // Notify Doctor if the cancel was performed by Admin
        if (currentStatus === "cancelled" && req.user.role === "admin") {
          const doctorEmail = appointment.doctor?.user?.email;
          if (doctorEmail) {
            const formattedDate = appointment.date ? new Date(appointment.date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric"
            }) : "N/A";

            await sendEmail({
              to: doctorEmail,
              subject: "Appointment Cancelled by Admin - MediChain",
              html: getAppointmentCancelledTemplate(
                appointment.doctor.user.name,
                appointment.patient.name,
                "patient",
                formattedDate,
                appointment.time
              )
            });
          }
        }
      }
    }

    res.status(200).json({
      message: "Appointment status updated successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function getAllAppointments(req, res) {
  try {
    const appointments = await appointmentModel
      .find()
      .sort({ date: -1, createdAt: -1 })
      .populate({ path: "doctor", populate: { path: "user", select: "name email" } })
      .populate("patient", "name email age gender bloodGroup weight profileImage");

    // Filter out appointments with deleted/missing patients or doctors
    const validAppointments = appointments.filter(
      (a) => a.patient && a.doctor
    );

    res.status(200).json({
      message: "Appointments fetched successfully",
      appointments: validAppointments,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function clearAppointmentHistory(req, res) {
  try {
    const result = await appointmentModel.deleteMany({
      status: { $in: ["completed", "cancelled"] }
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("appointmentsUpdated");
    }

    res.status(200).json({
      message: "Appointment history cleared successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}
