const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  parentId: String,
  userId: Number,
  name: String,
  targetAmount: Number,
  currentAmount: Number,
  incrementMonthly: Number,
  dateCreated: Date,
  category: String,
});

module.exports = mongoose.model("Goal", userSchema);
