const mongoose = require("mongoose");

/* Systematic Investment Plan */
const sipSchema = new mongoose.Schema(
  {
    parentId: String,
    userId: String,
    fundName: String,
    category: String, // equity, debt, hybrid, index, etc.
    monthlyAmount: Number,
    expectedReturn: Number, // expected annual % return
    durationMonths: Number,
    startDate: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sip", sipSchema);
