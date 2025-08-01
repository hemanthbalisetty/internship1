const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  donorId: String,
  recipientId: String,
  organ: String,
  status: { type: String, default: 'Requested' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Match', MatchSchema);