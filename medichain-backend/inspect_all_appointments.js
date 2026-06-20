import dotenv from "dotenv";
dotenv.config();

import connectDB from "./src/config/database.js";
import userModel from "./src/models/user.model.js";
import doctorModel from "./src/models/doctor.model.js";
import appointmentModel from "./src/models/appointment.model.js";

async function run() {
  await connectDB();
  console.log("Database connected.");

  const patientId = "6a29ad4d5137ea946b152441";
  const appointments = await appointmentModel.find({ patient: patientId })
    .populate("patient", "name email role")
    .populate({ path: "doctor", populate: { path: "user", select: "name email" } });

  console.log(`\nFound ${appointments.length} appointments for patient Adii:`);
  appointments.forEach((app, index) => {
    console.log(`\n--- Appointment ${index + 1} ---`);
    console.log("ID:", app._id);
    console.log("Status:", app.status);
    console.log("Date:", app.date);
    console.log("Time:", app.time);
    console.log("Reason:", app.reason);
    console.log("Medications:", app.prescriptions);
    console.log("Lab Orders:", app.labOrders);
  });

  process.exit(0);
}

run();
