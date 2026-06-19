import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import doctorRouter from "./routes/doctor.routes.js";
import appointmentRouter from "./routes/appointment.routes.js";
import adminRouter from "./routes/admin.routes.js";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    message: "MediChain API is running",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/doctors", doctorRouter);
app.use("/api/appointments", appointmentRouter);
app.use("/api/admin", adminRouter);

export default app;
