const mongoose = require("mongoose");

/* Salary / CTC profile — one active profile per user (keyed by parentId) */
const salarySchema = new mongoose.Schema(
  {
    parentId: String,
    userId: String,
    ctc: Number, // annual cost to company
    regime: {
      type: String,
      enum: ["old", "new"],
      default: "new",
    },
    /* annual breakdown components */
    basic: Number,
    hra: Number,
    specialAllowance: Number,
    lta: Number,
    bonus: Number,
    otherAllowances: Number,
    /* employer / statutory contributions (part of CTC, not in-hand) */
    employerPf: Number,
    employeePf: Number,
    gratuity: Number,
    professionalTax: Number,
    /* deductions used for tax (old regime) */
    deductions: {
      section80C: { type: Number, default: 0 },
      section80D: { type: Number, default: 0 },
      hraExemption: { type: Number, default: 0 },
      homeLoanInterest: { type: Number, default: 0 },
      others: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Salary", salarySchema);
