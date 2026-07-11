const mongoose = require("mongoose");

/* Fixed Deposit */
const fdSchema = new mongoose.Schema(
  {
    parentId: String,
    userId: String,
    bank: String,
    principal: Number, // amount invested
    interestRate: Number, // annual %
    tenureMonths: Number,
    compounding: {
      type: String,
      enum: ["monthly", "quarterly", "half-yearly", "yearly"],
      default: "quarterly",
    },
    startDate: Date,
    maturityDate: Date,
    maturityAmount: Number, // computed / stored value at maturity
  },
  { timestamps: true }
);

module.exports = mongoose.model("Fd", fdSchema);
