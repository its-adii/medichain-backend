import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { restrictTo } from "../middlewares/role.middleware.js";
import {
  registerValidator,
  loginValidator,
  updateMeValidator,
  validate,
} from "../validators/auth.validator.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

router.post("/register", registerValidator, validate, authController.register);
router.post("/login", loginValidator, validate, authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);
router.get("/me", verifyToken, authController.getMe);
router.patch("/me", verifyToken, upload.single("profileImage"), updateMeValidator, validate, authController.updateMe);
router.delete("/sessions/all", verifyToken, restrictTo("admin"), authController.revokeAllSessions);
router.get("/admin-only", verifyToken, restrictTo("admin"), (req, res) => {
  res.status(200).json({
    message: "Welcome admin!",
  });
});

export default router;
