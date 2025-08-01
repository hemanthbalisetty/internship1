// const mongoose = require('mongoose');

// const recipientSchema = new mongoose.Schema({
//   name: String,
//   requiredBloodGroup: String,
//   requiredOrgan: String,
//   location: String,
//   urgency: String,    // e.g., "high", "medium", "low"
//   contact: String
// });

// module.exports = mongoose.model('Recipient', recipientSchema);
const mongoose = require("mongoose");

const recipientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  bloodType: { type: String, required: true },
  otherDetails: { type: String }, // Optional field for additional information
});

const Recipient = mongoose.model("Recipient", recipientSchema);

module.exports = Recipient;