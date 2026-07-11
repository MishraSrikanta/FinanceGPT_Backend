const mongoose = require("mongoose");

/* Per-user preferences — one document per user (keyed by parentId) */
const settingsSchema = new mongoose.Schema(
  {
    parentId: String,
    userId: String,
    taxOnSalaryOnly: {
      type: Boolean,
      default: false, // when true, tax ignores secondary income
    },
    preferredRegime: {
      type: String,
      enum: ["old", "new"],
      default: "new",
    },
    currency: {
      type: String,
      default: "INR",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
