const mongoose = require("mongoose");

/* EMI / Loan */
const emiSchema = new mongoose.Schema(
  {
    parentId: String,
    userId: String,
    name: String, // e.g. "Home Loan", "Car Loan"
    lender: String, // bank / NBFC
    loanType: String, // home, car, personal, education, other
    principal: Number, // total loan amount
    emiAmount: Number, // monthly instalment
    interestRate: Number, // annual %
    tenureMonths: Number, // total tenure
    remainingMonths: Number, // remaining instalments
    startDate: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Emi", emiSchema);
