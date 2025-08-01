const mongoose = require("mongoose");

const recipientSchema = new mongoose.Schema({
  name: String,
  age: Number,
  gender: String,
  location: String,
  email: String,
  phone: String,
  organ: String,
  bloodType: String,
  urgency: String,
  medicalHistory: String,
  consent1: Boolean,
  consent2: Boolean,
});

module.exports = mongoose.model("Recipient", recipientSchema);