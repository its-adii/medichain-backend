import { Router } from "express";
import * as adminController from "../controllers/admin.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { restrictTo } from "../middlewares/role.middleware.js";

const router = Router();

router.get(
  "/users",
  verifyToken,
  restrictTo("admin"),
  adminController.getAllUsers,
);
router.delete(
  "/users/:id",
  verifyToken,
  restrictTo("admin"),
  adminController.deleteUser,
);
router.patch(
  "/doctors/:id/verify",
  verifyToken,
  restrictTo("admin"),
  adminController.verifyDoctor,
);
router.patch(
  "/doctors/:id/flag",
  verifyToken,
  restrictTo("admin"),
  adminController.toggleDoctorFlag,
);
router.get(
  "/doctors",
  verifyToken,
  restrictTo("admin"),
  adminController.getAllDoctors,
);
router.get(
  "/stats",
  verifyToken,
  restrictTo("admin"),
  adminController.getStats,
);
export default router;
