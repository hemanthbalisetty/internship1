const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  id: { type: String, unique: true },
  email: String,
  password: String,
  location: String
});

module.exports = mongoose.model('User', userSchema);