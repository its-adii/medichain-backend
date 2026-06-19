import { body, validationResult } from "express-validator";

export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg,
    });
  }
  next();
}

export const appointmentValidator = [
  body("doctorId")
    .notEmpty()
    .withMessage("Doctor ID is required")
    .isMongoId()
    .withMessage("Doctor ID must be a valid ID"),

  body("date")
    .notEmpty()
    .withMessage("Date is required")
    .isDate()
    .withMessage("Date must be a valid date"),

  body("time").notEmpty().withMessage("Time is required"),

  body("reason")
    .notEmpty()
    .withMessage("Reason is required")
    .isLength({ min: 10 })
    .withMessage("Reason must be at least 10 characters"),
];
