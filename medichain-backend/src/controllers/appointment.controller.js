import appointmentModel from "../models/appointment.model.js";
import doctorModel from "../models/doctor.model.js";
import userModel from "../models/user.model.js";
import { sendEmail } from "../services/email.service.js";
import {
  getAppointmentRequestTemplate,
  getAppointmentConfirmedTemplate,
  getAppointmentCancelledTemplate,
  getConsultationCompletedTemplate,
  getDoctorAppointmentAlertTemplate,
  getGenericStatusUpdateTemplate
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
        subject: "New Appointment Request - MediChain",
        html: getDoctorAppointmentAlertTemplate(
          doctor.user.name,
          req.user.name,
          formattedDate,
          time,
          reason
        )
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
            htmlContent = getGenericStatusUpdateTemplate(
              appointment.patient.name,
              doctorName,
              currentStatus,
              formattedDate,
              appointment.time || "N/A"
            );
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
