import mongoose from "mongoose";
import dotenv from "dotenv";
import appointmentModel from "./src/models/appointment.model.js";
import { updateAppointmentStatus } from "./src/controllers/appointment.controller.js";

dotenv.config();

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  const appointment = await appointmentModel.findOne({ status: "confirmed" });
  if (!appointment) {
    console.log("No confirmed appointments found");
    process.exit(0);
  }

  console.log("Found appointment:", appointment._id);

  const req = {
    params: { id: appointment._id },
    body: { status: "cancelled" },
    user: { role: "doctor", _id: appointment.doctor },
    app: { get: () => null }
  };

  const res = {
    status: (code) => { console.log("Status:", code); return res; },
    json: (data) => { console.log("Response:", data); }
  };

  await updateAppointmentStatus(req, res);
  process.exit(0);
}

test().catch(console.error);
