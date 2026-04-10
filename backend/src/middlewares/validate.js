const { z } = require("zod");
const AppError = require("../utils/AppError");

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const msg = result.error.errors.map((e) => e.message).join(", ");
    return next(new AppError(msg, 400));
  }
  req.body = result.data;
  next();
};

// ── Schemas ──────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "Food & Dining","Transportation","Shopping","Entertainment",
  "Healthcare","Housing","Education","Travel","Personal Care","Other",
];

exports.validateRegister = validate(
  z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(60),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  })
);

exports.validateLogin = validate(
  z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(1, "Password is required"),
  })
);

exports.validateExpense = validate(
  z.object({
    title: z.string().min(1, "Title is required").max(100, "Title too long"),
    amount: z.number({ required_error: "Amount is required" }).positive("Amount must be positive"),
    category: z.enum(CATEGORIES).optional().default("Other"),
    note: z.string().max(300, "Note too long").optional(),
    date: z.string().optional().transform((v) => (v ? new Date(v) : new Date())),
    paymentMethod: z.enum(["Cash", "Card", "UPI", "Net Banking", "Other"]).optional().default("Other"),
    tags: z.array(z.string()).optional().default([]),
  })
);

exports.validateUpdateExpense = validate(
  z.object({
    title: z.string().min(1).max(100).optional(),
    amount: z.number().positive().optional(),
    category: z.enum(CATEGORIES).optional(),
    note: z.string().max(300).optional(),
    date: z.string().optional().transform((v) => (v ? new Date(v) : undefined)),
    paymentMethod: z.enum(["Cash", "Card", "UPI", "Net Banking", "Other"]).optional(),
    tags: z.array(z.string()).optional(),
  })
);

exports.validateUpdateProfile = validate(
  z.object({
    name: z.string().min(2).max(60).optional(),
    monthlyBudget: z.coerce.number().min(0).optional(),
    currency: z.enum(["INR", "USD", "EUR", "GBP"]).optional(),
  })
);
