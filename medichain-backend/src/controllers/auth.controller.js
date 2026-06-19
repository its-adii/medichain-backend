import { uploadToImageKit } from "../middlewares/upload.middleware.js";
import userModel from "../models/user.model.js";
import sessionModel from "../models/session.model.js";
import doctorModel from "../models/doctor.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import config from "../config/config.js";
import { sendEmail } from "../services/email.service.js";
import { getVerificationEmailTemplate, getPasswordResetEmailTemplate } from "../services/emailTemplates.js";


export async function register(req, res) {
  try {
    const { name, email, password, role, specialization } = req.body;

    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    // Generate 6-digit OTP
    const verificationOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationOtpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
      role,
      isEmailVerified: false,
      verificationOtp,
      verificationOtpExpiry,
    });

    if (role === "doctor") {
      await doctorModel.create({
        user: user._id,
        specialization: specialization || "General Medicine",
        experience: 0,
        fees: 0,
        availability: [
          { day: "monday", startTime: "09:00", endTime: "17:00" },
          { day: "tuesday", startTime: "09:00", endTime: "17:00" },
          { day: "wednesday", startTime: "09:00", endTime: "17:00" },
          { day: "thursday", startTime: "09:00", endTime: "17:00" },
          { day: "friday", startTime: "09:00", endTime: "17:00" }
        ],
        bio: "Doctor profile is under setup.",
        profileImage: "",
      });
    }

    // Send Verification Email
    await sendEmail({
      to: user.email,
      subject: "Verify your email address - MediChain",
      html: getVerificationEmailTemplate(user.name, verificationOtp),
    });

    const refreshToken = jwt.sign(
      {
        id: user._id,
      },
      config.JWT_SECRET,
      { expiresIn: "7d" },
    );

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const session = await sessionModel.create({
      user: user._id,
      refreshTokenHash,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    const accessToken = jwt.sign(
      {
        id: user._id,
        sessionId: session._id,
      },
      config.JWT_SECRET,
      { expiresIn: "15m" },
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("usersUpdated");
      if (role === "doctor") {
        io.emit("doctorsUpdated");
      }
    }

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        age: user.age,
        gender: user.gender,
        bloodGroup: user.bloodGroup,
        weight: user.weight,
        isEmailVerified: user.isEmailVerified,
        isGoogleUser: user.isGoogleUser,
      },
      accessToken,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    if (hashedPassword !== user.password) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const refreshToken = jwt.sign(
      {
        id: user._id,
      },
      config.JWT_SECRET,
      { expiresIn: "7d" },
    );

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const session = await sessionModel.create({
      user: user._id,
      refreshTokenHash,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    const accessToken = jwt.sign(
      {
        id: user._id,
        sessionId: session._id,
      },
      config.JWT_SECRET,
      { expiresIn: "15m" },
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "User logged in successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        age: user.age,
        gender: user.gender,
        bloodGroup: user.bloodGroup,
        weight: user.weight,
        isEmailVerified: user.isEmailVerified,
        isGoogleUser: user.isGoogleUser,
      },
      accessToken,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function refreshToken(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token not found",
      });
    }

    const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const session = await sessionModel.findOne({
      refreshTokenHash,
      revoked: false,
    });

    if (!session) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    const newResfreshToken = jwt.sign(
      {
        id: decoded.id,
      },
      config.JWT_SECRET,
      { expiresIn: "7d" },
    );

    const newRefreshTokenHash = crypto
      .createHash("sha256")
      .update(newResfreshToken)
      .digest("hex");

    session.refreshTokenHash = newRefreshTokenHash;
    await session.save();

    const accessToken = jwt.sign(
      {
        id: decoded.id,
        sessionId: session._id,
      },
      config.JWT_SECRET,
      { expiresIn: "15m" },
    );

    res.cookie("refreshToken", newResfreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Token refreshed successfully",
      accessToken,
    });
  } catch (error) {
    if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid or expired refresh token",
      });
    }
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function logout(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token not found",
      });
    }

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const session = await sessionModel.findOne({
      refreshTokenHash,
      revoked: false,
    });

    if (!session) {
      return res.status(400).json({
        message: "Invalid refresh token",
      });
    }

    session.revoked = true;
    await session.save();

    res.clearCookie("refreshToken");

    res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function getMe(req, res) {
  try {
    const user = await userModel.findById(req.user.id);

    res.status(200).json({
      message: "User fetched successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        age: user.age,
        gender: user.gender,
        bloodGroup: user.bloodGroup,
        weight: user.weight,
        isEmailVerified: user.isEmailVerified,
        isGoogleUser: user.isGoogleUser,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function updateMe(req, res) {
  try {
    const { name, email, password, profileImage, age, gender, bloodGroup, weight } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    if (age !== undefined) updateData.age = age;
    if (gender !== undefined) updateData.gender = gender;
    if (bloodGroup !== undefined) updateData.bloodGroup = bloodGroup;
    if (weight !== undefined) updateData.weight = weight;

    if (req.file) {
      try {
        const uploadedImageUrl = await uploadToImageKit(req.file, req);
        updateData.profileImage = uploadedImageUrl;
      } catch (uploadError) {
        console.error("ImageKit upload failed during updateMe:", uploadError.message);
      }
    }

    if (email && email !== req.user.email) {
      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          message: "Email is already in use by another account",
        });
      }
      updateData.email = email;
    }

    if (password) {
      const hashedPassword = crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");
      updateData.password = hashedPassword;
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    );

    if (updatedUser.role === "doctor" && updateData.profileImage !== undefined) {
      await doctorModel.findOneAndUpdate(
        { user: updatedUser._id },
        { profileImage: updateData.profileImage }
      );
    }

    const io = req.app.get("io");
    if (io) {
      io.emit("usersUpdated");
      if (updatedUser.role === "doctor") {
        io.emit("doctorsUpdated");
      }
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profileImage: updatedUser.profileImage,
        age: updatedUser.age,
        gender: updatedUser.gender,
        bloodGroup: updatedUser.bloodGroup,
        weight: updatedUser.weight,
        isEmailVerified: updatedUser.isEmailVerified,
        isGoogleUser: updatedUser.isGoogleUser,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function revokeAllSessions(req, res) {
  try {
    const result = await sessionModel.updateMany({ revoked: false }, { revoked: true });
    res.status(200).json({
      message: "All active user sessions revoked successfully",
      count: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function googleLogin(req, res) {
  try {
    const { credential } = req.body;
    let email, name, profileImage = "";

    if (credential && credential.startsWith("mock-google-token-")) {
      // Mock Sandbox Mode
      const rest = credential.substring("mock-google-token-".length);
      const parts = rest.split(":");
      email = parts[0];
      name = parts[1] || "Google User";
      profileImage = "";
    } else {
      // Real Google ID Token Verification via Google API
      const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
      if (!verifyRes.ok) {
        return res.status(400).json({ message: "Invalid Google token" });
      }
      const data = await verifyRes.json();
      email = data.email;
      name = data.name || data.given_name || "Google User";
      profileImage = data.picture || "";
      if (!email) {
        return res.status(400).json({ message: "Email not provided by Google" });
      }
    }

    let user = await userModel.findOne({ email });

    if (!user) {
      // Create new user (automatically verified since verified by Google)
      user = await userModel.create({
        name,
        email,
        role: "patient",
        isGoogleUser: true,
        isEmailVerified: true,
        profileImage,
      });
    } else {
      // If user exists, ensure they are flagged as Google user/verified
      if (!user.isGoogleUser) {
        user.isGoogleUser = true;
        user.isEmailVerified = true;
        await user.save();
      }
    }

    // Generate session & JWT tokens
    const refreshToken = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: "7d" });
    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    
    const session = await sessionModel.create({
      user: user._id,
      refreshTokenHash,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    const accessToken = jwt.sign(
      { id: user._id, sessionId: session._id },
      config.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("usersUpdated");
    }

    res.status(200).json({
      message: "Google login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        age: user.age,
        gender: user.gender,
        bloodGroup: user.bloodGroup,
        weight: user.weight,
        isEmailVerified: user.isEmailVerified,
        isGoogleUser: user.isGoogleUser,
      },
      accessToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function verifyEmail(req, res) {
  try {
    const { email, otp } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    if (!user.verificationOtp || user.verificationOtp !== otp) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    if (!user.verificationOtpExpiry || new Date() > user.verificationOtpExpiry) {
      return res.status(400).json({ message: "Verification code has expired" });
    }

    user.isEmailVerified = true;
    user.verificationOtp = null;
    user.verificationOtpExpiry = null;
    await user.save();

    res.status(200).json({
      message: "Email verified successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        isEmailVerified: user.isEmailVerified,
        isGoogleUser: user.isGoogleUser,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function resendVerificationOtp(req, res) {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    // Generate new OTP
    const verificationOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationOtpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    user.verificationOtp = verificationOtp;
    user.verificationOtpExpiry = verificationOtpExpiry;
    await user.save();

    // Send email
    await sendEmail({
      to: user.email,
      subject: "Verify your email address - MediChain",
      html: getVerificationEmailTemplate(user.name, verificationOtp),
    });

    res.status(200).json({ message: "Verification code sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found with this email" });
    }

    if (user.isGoogleUser) {
      return res.status(400).json({ message: "This email is registered with Google. Please use Google Login." });
    }

    // Generate new reset OTP
    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const resetOtpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    user.resetPasswordOtp = resetOtp;
    user.resetPasswordOtpExpiry = resetOtpExpiry;
    await user.save();

    // Send email
    await sendEmail({
      to: user.email,
      subject: "Reset your password - MediChain",
      html: getPasswordResetEmailTemplate(user.name, resetOtp),
    });

    res.status(200).json({ message: "Password reset passcode sent to your email" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function resetPassword(req, res) {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.resetPasswordOtp || user.resetPasswordOtp !== otp) {
      return res.status(400).json({ message: "Invalid passcode" });
    }

    if (!user.resetPasswordOtpExpiry || new Date() > user.resetPasswordOtpExpiry) {
      return res.status(400).json({ message: "Passcode has expired" });
    }

    // Hash and update password
    const hashedPassword = crypto
      .createHash("sha256")
      .update(newPassword)
      .digest("hex");

    user.password = hashedPassword;
    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpiry = null;
    await user.save();

    res.status(200).json({ message: "Password reset successfully. You can now login." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

