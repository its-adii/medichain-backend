import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import "./src/models/user.model.js";
import doctorModel from "./src/models/doctor.model.js";

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const doctorId = "6a2bc267fc80a7b1476c5bbf";
  console.log(`Finding doctor by ID: ${doctorId}`);
  const currentDoctor = await doctorModel.findById(doctorId);
  if (!currentDoctor) {
    console.log("Doctor not found!");
    process.exit(1);
  }

  console.log("Found doctor:", currentDoctor);

  try {
    const doctor = await doctorModel
      .findByIdAndUpdate(
        doctorId,
        { isVerified: !currentDoctor.isVerified },
        { new: true, runValidators: false },
      )
      .populate("user", "name email role");
    console.log("Updated doctor successfully:", doctor);
  } catch (err) {
    console.error("CRASHED UPDATE:", err);
  }

  process.exit(0);
}

run().catch(err => {
  console.error("GLOBAL CRASH:", err);
  process.exit(1);
});
