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

export const doctorValidator = [
  body("specialization")
    .notEmpty()
    .withMessage("Specialization is required")
    .isLength({ min: 3 })
    .withMessage("Specialization must be at least 3 characters"),

  body("experience")
    .notEmpty()
    .withMessage("Experience is required")
    .isNumeric()
    .withMessage("Experience must be number")
    .custom((value) => value >= 0)
    .withMessage("Experience cannot be negative"),

  body("fees")
    .notEmpty()
    .withMessage("Fees is required")
    .isNumeric()
    .withMessage("Fees must be number")
    .custom((value) => value >= 0)
    .withMessage("Fees cannot be negative"),

  body("availability")
    .optional()
    .custom((value) => {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) && parsed.length > 0;
      } catch {
        return false;
      }
    })
    .withMessage("Availability must have at least one slot"),

  body("license")
    .optional()
    .isString()
    .withMessage("License must be a string"),

  body("issuingBody")
    .optional()
    .isString()
    .withMessage("Issuing Body must be a string"),

  body("school")
    .optional()
    .isString()
    .withMessage("School must be a string"),

  body("gradYear")
    .optional()
    .custom((value) => {
      if (value === "" || value === undefined || value === null) return true;
      const yr = Number(value);
      return !isNaN(yr) && yr > 1900 && yr <= new Date().getFullYear() + 10;
    })
    .withMessage("Graduation year must be a valid year"),

  body("specialties")
    .optional()
    .custom((value) => {
      if (!value) return true;
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed);
      } catch {
        return Array.isArray(value);
      }
    })
    .withMessage("Specialties must be a valid array"),
];
