const mongoose = require("mongoose");

const CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Healthcare",
  "Housing",
  "Education",
  "Travel",
  "Personal Care",
  "Other",
];

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title must be under 100 characters"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be positive"],
      set: (v) => parseFloat(v.toFixed(2)),
    },
    category: {
      type: String,
      enum: { values: CATEGORIES, message: "{VALUE} is not a valid category" },
      default: "Other",
    },
    note: {
      type: String,
      trim: true,
      maxlength: [300, "Note must be under 300 characters"],
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Card", "UPI", "Net Banking", "Other"],
      default: "Other",
    },
    tags: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for common query: user's expenses sorted by date
expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1 });

// Virtual: formatted date
expenseSchema.virtual("dateFormatted").get(function () {
  return this.date?.toISOString().split("T")[0];
});

expenseSchema.statics.CATEGORIES = CATEGORIES;

module.exports = mongoose.model("Expense", expenseSchema);
