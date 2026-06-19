import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Patient is required"],
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    time: {
      type: String,
      required: [true, "Time is required"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    reason: {
      type: String,
      required: [true, "Reason is required"],
      trim: true,
    },
    clinicalNotes: {
      type: String,
      default: "",
    },
    prescriptions: [
      {
        medicineName: { type: String, required: true },
        dosage: { type: String, required: true },
        duration: { type: String, default: "" },
        refillable: { type: Boolean, default: false },
      },
    ],
    labOrders: [
      {
        testName: { type: String, required: true },
        status: { type: String, enum: ["pending", "completed"], default: "pending" },
      },
    ],
  },
  { timestamps: true },
);

const appointmentModel = mongoose.model("Appointment", appointmentSchema);

export default appointmentModel;
