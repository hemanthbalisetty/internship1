const mongoose = require("mongoose");
console.log("rp");
const donorSchema = new mongoose.Schema({
  name: String,
  age: Number,
  gender: String,
  location: String,
  email: String,
  phone: String,
  donationType: String,
  bloodType: String,
  organType: String,
  medicalHistory: String,
  consent1: Boolean,
  consent2: Boolean,
});

module.exports = mongoose.model("Donor", donorSchema);
