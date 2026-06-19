import { Router } from "express";
import * as appointmentController from "../controllers/appointment.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { restrictTo } from "../middlewares/role.middleware.js";
import {
  appointmentValidator,
  validate,
} from "../validators/appointment.validator.js";

const router = Router();

router.post(
  "/",
  verifyToken,
  restrictTo("patient", "admin"),
  appointmentValidator,
  validate,
  appointmentController.bookAppointment,
);
router.get(
  "/my",
  verifyToken,
  restrictTo("patient"),
  appointmentController.getMyAppointments,
);
router.get(
  "/doctor",
  verifyToken,
  restrictTo("doctor"),
  appointmentController.getDoctorAppointments,
);
router.get(
  "/",
  verifyToken,
  restrictTo("admin"),
  appointmentController.getAllAppointments,
);
router.delete(
  "/history",
  verifyToken,
  restrictTo("admin"),
  appointmentController.clearAppointmentHistory,
);
router.patch(
  "/:id/status",
  verifyToken,
  restrictTo("patient", "doctor", "admin"),
  appointmentController.updateAppointmentStatus,
);

export default router;
