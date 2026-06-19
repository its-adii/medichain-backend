import { uploadToImageKit } from "../middlewares/upload.middleware.js";
import doctorModel from "../models/doctor.model.js";
import userModel from "../models/user.model.js";

export async function createProfile(req, res) {
  try {
    const { specialization, experience, fees, bio, license, issuingBody, school, gradYear } = req.body;
    const availability = req.body.availability ? JSON.parse(req.body.availability) : [];
    let specialties = [];
    if (req.body.specialties) {
      try {
        specialties = JSON.parse(req.body.specialties);
      } catch {
        specialties = Array.isArray(req.body.specialties) ? req.body.specialties : [];
      }
    }

    const existingProfile = await doctorModel.findOne({
      user: req.user._id,
    });

    if (existingProfile) {
      return res.status(409).json({
        message: "Doctor profile already exists",
      });
    }

    let profileImage = "";
    if (req.file) {
      try {
        profileImage = await uploadToImageKit(req.file, req);
      } catch (uploadError) {
        console.error("ImageKit upload failed during profile creation:", uploadError.message);
        // Save without image on failure instead of 500 error
      }
    }

    const doctor = await doctorModel.create({
      user: req.user._id,
      specialization,
      experience,
      fees,
      availability,
      bio,
      profileImage,
      license,
      issuingBody,
      school,
      gradYear: gradYear ? Number(gradYear) : undefined,
      specialties,
    });

    if (profileImage) {
      await userModel.findByIdAndUpdate(req.user._id, { profileImage });
    }

    const io = req.app.get("io");
    if (io) {
      io.emit("doctorsUpdated");
    }

    res.status(201).json({
      message: "Doctor profile created successfully",
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function getAllDoctors(req, res) {
  try {
    const { page = 1, limit = 10, specialization, search, minExperience, maxFees } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const doctorQuery = {};

    if (specialization && specialization !== "All") {
      doctorQuery.specialization = specialization;
    }
    if (minExperience) {
      doctorQuery.experience = { $gte: parseInt(minExperience) };
    }
    if (maxFees) {
      doctorQuery.fees = { $lte: parseInt(maxFees) };
    }

    if (search) {
      const users = await userModel.find({
        role: "doctor",
        name: { $regex: search, $options: "i" }
      }).select("_id");

      const userIds = users.map(u => u._id);

      doctorQuery.$or = [
        { user: { $in: userIds } },
        { specialization: { $regex: search, $options: "i" } }
      ];
    }

    const doctors = await doctorModel.find(doctorQuery)
      .populate({
        path: "user",
        select: "name email role",
        match: { role: "doctor" }
      });

    const filteredDoctors = doctors.filter(doc => doc.user !== null);

    const total = filteredDoctors.length;
    const paginatedDoctors = filteredDoctors.slice(skip, skip + limitNum);

    res.status(200).json({
      message: "Doctors fetched successfully",
      doctors: paginatedDoctors,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function getDoctorById(req, res) {
  try {
    const doctor = await doctorModel
      .findById(req.params.id)
      .populate("user", "name email");

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    res.status(200).json({
      message: "Doctor fetched successfully",
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function updateProfile(req, res) {
  try {
    const { specialization, experience, fees, bio, license, issuingBody, school, gradYear } = req.body;
    const availability = req.body.availability ? JSON.parse(req.body.availability) : [];
    let specialties = [];
    if (req.body.specialties) {
      try {
        specialties = JSON.parse(req.body.specialties);
      } catch {
        specialties = Array.isArray(req.body.specialties) ? req.body.specialties : [];
      }
    }
    let profileImage;
    if (req.file) {
      try {
        profileImage = await uploadToImageKit(req.file, req);
      } catch (uploadError) {
        console.error("ImageKit upload failed during profile update:", uploadError.message);
        // Retain existing image or do not update since upload failed
      }
    }

    const doctor = await doctorModel.findOneAndUpdate(
      {
        user: req.user._id,
      },
      {
        specialization,
        experience,
        fees,
        availability,
        bio,
        license,
        issuingBody,
        school,
        gradYear: gradYear ? Number(gradYear) : undefined,
        specialties,
        ...(profileImage && { profileImage }),
      },
      { new: true },
    );

    if (doctor && profileImage) {
      await userModel.findByIdAndUpdate(req.user._id, { profileImage });
    }

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }
    const io = req.app.get("io");
    if (io) {
      io.emit("doctorsUpdated");
    }

    res.status(200).json({
      message: "Doctor profile updated successfully",
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function getMyProfile(req, res) {
  try {
    const doctor = await doctorModel.findOne({ user: req.user._id }).populate("user", "name email");
    if (!doctor) {
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }
    res.status(200).json({
      message: "Doctor profile fetched successfully",
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}
