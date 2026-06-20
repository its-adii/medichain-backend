import dotenv from "dotenv";
dotenv.config();

import connectDB from "./src/config/database.js";
import userModel from "./src/models/user.model.js";
import doctorModel from "./src/models/doctor.model.js";
import appointmentModel from "./src/models/appointment.model.js";

async function run() {
  await connectDB();
  console.log("Database connected.");

  const appointmentId = "6a364fb8d5cd3c865111c6ed";
  const appointment = await appointmentModel.findById(appointmentId)
    .populate("patient", "name email role")
    .populate({ path: "doctor", populate: { path: "user", select: "name email" } });

  if (!appointment) {
    console.log("Appointment not found");
    process.exit(0);
  }

  console.log("\n--- Appointment Details ---");
  console.log("ID:", appointment._id);
  console.log("Status:", appointment.status);
  console.log("Time:", appointment.time);
  console.log("Date:", appointment.date);
  
  console.log("\n--- Patient Details ---");
  if (appointment.patient) {
    console.log("ID:", appointment.patient._id);
    console.log("Name:", appointment.patient.name);
    console.log("Email:", appointment.patient.email);
    console.log("Role:", appointment.patient.role);
  } else {
    console.log("Patient reference is NULL/missing");
  }

  console.log("\n--- Doctor User Details ---");
  if (appointment.doctor && appointment.doctor.user) {
    console.log("Doctor User ID:", appointment.doctor.user._id);
    console.log("Doctor Name:", appointment.doctor.user.name);
    console.log("Doctor Email:", appointment.doctor.user.email);
  } else {
    console.log("Doctor/User reference is NULL/missing");
  }

  process.exit(0);
}

run();
