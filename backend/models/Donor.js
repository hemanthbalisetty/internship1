const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  name: String,
  bloodGroup: String,
  organ: String,        
  location: String,
  contact: String,
  status: { type: String, default: 'available' },  // "available", "donated"
});

module.exports = mongoose.model('Donor', donorSchema);