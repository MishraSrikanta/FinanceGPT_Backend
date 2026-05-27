const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: String,
  password: {
    type: String,
    required: true,
  },
  otp: String,
  otpExpiry: Date,
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);