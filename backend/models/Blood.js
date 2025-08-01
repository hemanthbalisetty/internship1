const mongoose = require('mongoose');

const bloodSchema = new mongoose.Schema({
  name: String,
  bloodGroup: String,
  location: String,
  donorOrRecipient: String, // 'donor' or 'recipient'
  hospitalId: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Blood', bloodSchema);