const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  parentId: String,
  userId: String,
  title: String,
  amount: Number,
  source: String,
  date: Date,
  description: String,
});

module.exports = mongoose.model("Income", userSchema);
