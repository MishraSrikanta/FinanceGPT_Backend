const mongoose = require("mongoose");

/* Secondary income stream (rent, freelance, dividends, etc.) */
const secondaryIncomeSchema = new mongoose.Schema(
  {
    parentId: String,
    userId: String,
    title: String,
    source: String,
    amount: Number, // amount per period (see frequency)
    frequency: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
    date: Date,
    description: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("SecondaryIncome", secondaryIncomeSchema);
