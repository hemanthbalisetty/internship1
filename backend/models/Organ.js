const mongoose = require('mongoose');

const OrganSchema = new mongoose.Schema({
  organ: String,
  id: String,
  location: String,
  status: String,
  availability: String,
  role: { type: String, enum: ['donor', 'recipient'] }
});

module.exports = mongoose.model('Organ', OrganSchema);