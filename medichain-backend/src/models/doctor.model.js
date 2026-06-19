import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      unique: true,
    },
    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      trim: true,
    },
    experience: {
      type: Number,
      required: [true, "Experience is required"],
      min: [0, "Experience cannot be negative"],
    },
    fees: {
      type: Number,
      required: [true, "Fees is required"],
      min: [0, "Fees cannot be negative"],
    },
    availability: [
      {
        day: {
          type: String,
          enum: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ],
          required: [true, "Day is required"],
        },
        startTime: {
          type: String,
          required: [true, "Start time is required"],
        },
        endTime: {
          type: String,
          required: [true, "End time is required"],
        },
      },
    ],
    bio: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
    license: {
      type: String,
      default: "",
    },
    issuingBody: {
      type: String,
      default: "",
    },
    school: {
      type: String,
      default: "",
    },
    gradYear: {
      type: Number,
    },
    specialties: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true },
);

const doctorModel = mongoose.model("Doctor", doctorSchema);

export default doctorModel;
