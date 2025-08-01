const mongoose = require('mongoose');

const orgSchema = new mongoose.Schema({
  name: String,
  id: { type: String, unique: true },
  email: String,
  password: String,
  location: String,
});

module.exports = mongoose.model('Organization', orgSchema);