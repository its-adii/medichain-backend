import appointmentModel from "../models/appointment.model.js";
import doctorModel from "../models/doctor.model.js";
import userModel from "../models/user.model.js";
import { sendEmail } from "../services/email.service.js";

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
    // 1. Patient Confirmation
    sendEmail({
      to: patientUser.email,
      subject: "Appointment Confirmed - MediChain",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px;">
          <h2 style="color: #2563eb;">Your Appointment is Booked!</h2>
          <p>Hello <strong>${patientUser.name}</strong>,</p>
          <p>Your appointment with <strong>Dr. ${doctor.user.name}</strong> has been successfully booked.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${time}</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">You can cancel or view status updates directly inside your patient dashboard.</p>
        </div>
      `
    });

    // 2. Doctor Alert
    if (doctor.user && doctor.user.email) {
      sendEmail({
        to: doctor.user.email,
        subject: "New Appointment Booked - MediChain",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0;">
            <h2 style="color: #2563eb;">New Appointment Received</h2>
            <p>Hello <strong>Dr. ${doctor.user.name}</strong>,</p>
            <p>A new appointment has been scheduled with you by <strong>${req.user.name}</strong>.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time:</strong> ${time}</p>
            <p><strong>Reason:</strong> ${reason}</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #64748b;">Please review and update the status of this booking in your doctor panel.</p>
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

    if (req.user.role === "patient") {
      const doctor = await doctorModel.findById(appointment.doctor).populate("user", "name email");
      if (doctor) {
        const doctorSocketId = users.get(doctor.user._id.toString());
        if (doctorSocketId) {
          io.to(doctorSocketId).emit("appointmentStatusChanged", {
            message: `Appointment on ${new Date(appointment.date).toISOString().split("T")[0]} was cancelled by patient ${req.user.name}`,
            appointment
          });
        }

        // Email Alert to Doctor
        if (doctor.user && doctor.user.email) {
          sendEmail({
            to: doctor.user.email,
            subject: "Appointment Cancelled by Patient - MediChain",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0;">
                <h2 style="color: #ef4444;">Appointment Cancelled</h2>
                <p>Hello <strong>Dr. ${doctor.user.name}</strong>,</p>
                <p>Your appointment on <strong>${new Date(appointment.date).toISOString().split("T")[0]}</strong> at <strong>${appointment.time}</strong> has been cancelled by patient <strong>${req.user.name}</strong>.</p>
              </div>
            `
          });
        }
      }
    } else {
      const patientSocketId = users.get(appointment.patient._id.toString());
      if (patientSocketId) {
        io.to(patientSocketId).emit("appointmentStatusChanged", {
          message: `Your appointment status was updated to '${status}'`,
          appointment
        });
      }

      // Email Alert to Patient
      if (appointment.patient && appointment.patient.email) {
        sendEmail({
          to: appointment.patient.email,
          subject: `Appointment Status Update: ${status.toUpperCase()} - MediChain`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0;">
              <h2 style="color: #2563eb;">Appointment Status Update</h2>
              <p>Hello <strong>${appointment.patient.name}</strong>,</p>
              <p>Your appointment with <strong>Dr. ${appointment.doctor.user.name}</strong> has been updated to <strong>${status.toUpperCase()}</strong>.</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p><strong>Date:</strong> ${new Date(appointment.date).toISOString().split("T")[0]}</p>
              <p><strong>Time:</strong> ${appointment.time}</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 12px; color: #64748b;">Please sign into your MediChain dashboard to view your schedule details.</p>
            </div>
          `
        });
      }
    }

    if (io) {
      io.emit("appointmentsUpdated");
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
