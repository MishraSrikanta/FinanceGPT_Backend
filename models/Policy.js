const mongoose = require("mongoose");

/* Insurance / investment policy */
const policySchema = new mongoose.Schema(
  {
    parentId: String,
    userId: String,
    policyName: String,
    provider: String, // insurer / fund house
    policyNumber: String,
    type: {
      type: String,
      enum: ["life", "term", "health", "ulip", "endowment", "motor", "investment", "other"],
      default: "life",
    },
    premium: Number, // amount per premium period
    premiumFrequency: {
      type: String,
      enum: ["monthly", "quarterly", "half-yearly", "yearly", "single"],
      default: "yearly",
    },
    sumAssured: Number,
    nominee: String,
    startDate: Date,
    maturityDate: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Policy", policySchema);
