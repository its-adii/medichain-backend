import { Router } from "express";
import * as doctorController from "../controllers/doctor.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { restrictTo } from "../middlewares/role.middleware.js";
import { doctorValidator, validate } from "../validators/doctor.validator.js";
import { upload } from "../middlewares/upload.middleware.js";
const router = Router();

router.post(
  "/profile",
  verifyToken,
  restrictTo("doctor", "admin"),
  upload.single("profileImage"),
  doctorValidator,
  validate,
  doctorController.createProfile,
);
router.get("/", doctorController.getAllDoctors);
router.get("/profile/me", verifyToken, restrictTo("doctor"), doctorController.getMyProfile);
router.get("/:id", doctorController.getDoctorById);
router.patch(
  "/profile",
  verifyToken,
  restrictTo("doctor", "admin"),
  upload.single("profileImage"),
  doctorValidator,
  validate,
  doctorController.updateProfile,
);

export default router;
