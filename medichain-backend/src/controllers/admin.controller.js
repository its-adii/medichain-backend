import userModel from "../models/user.model.js";
import doctorModel from "../models/doctor.model.js";
import appointmentModel from "../models/appointment.model.js";

export async function getAllUsers(req, res) {
  try {
    const users = await userModel.find().select("-password");

    res.status(200).json({
      message: "User fetched successfully",
      users,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function deleteUser(req, res) {
  try {
    const user = await userModel.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const io = req.app.get("io");
    if (io) {
      io.emit("usersUpdated");
    }

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function verifyDoctor(req, res) {
  try {
    const currentDoctor = await doctorModel.findById(req.params.id);
    if (!currentDoctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    const doctor = await doctorModel
      .findByIdAndUpdate(
        req.params.id,
        { isVerified: !currentDoctor.isVerified },
        { new: true },
      )
      .populate("user", "name email role");

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    const io = req.app.get("io");
    if (io) {
      io.emit("doctorsUpdated");
    }

    res.status(200).json({
      message: "Doctor verified successfully",
      doctor,
    });
  } catch (error) {
    console.error("Error in verifyDoctor:", error);
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function toggleDoctorFlag(req, res) {
  try {
    const currentDoctor = await doctorModel.findById(req.params.id);
    if (!currentDoctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    const doctor = await doctorModel
      .findByIdAndUpdate(
        req.params.id,
        { isFlagged: !currentDoctor.isFlagged },
        { new: true },
      )
      .populate("user", "name email role");

    const io = req.app.get("io");
    if (io) {
      io.emit("doctorsUpdated");
    }

    res.status(200).json({
      message: doctor.isFlagged
        ? "Doctor credentials flagged successfully"
        : "Doctor credential flag cleared successfully",
      doctor,
    });
  } catch (error) {
    console.error("Error in toggleDoctorFlag:", error);
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function getAllDoctors(req, res) {
  try {
    const doctors = await doctorModel
      .find()
      .populate({ path: "user", select: "name email role", match: { role: "doctor" } });

    const doctorUsersOnly = doctors.filter((doctor) => doctor.user);

    res.status(200).json({
      message: "Doctors fetched successfully",
      doctors: doctorUsersOnly,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function getStats(req, res) {
  try {
    const [totalUsers, totalDoctors, totalPatients, totalAppointments] = await Promise.all([
      userModel.countDocuments(),
      userModel.countDocuments({ role: "doctor" }),
      userModel.countDocuments({ role: "patient" }),
      appointmentModel.countDocuments(),
    ]);

    res.status(200).json({
      message: "Stats fetched successfully",
      stats: { totalUsers, totalDoctors, totalPatients, totalAppointments },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}


