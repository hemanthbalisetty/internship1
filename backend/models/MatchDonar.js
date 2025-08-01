// const mongoose = require('mongoose');

// const donorSchema = new mongoose.Schema({
//   name: String,
//   age: Number,
//   gender: String,
//   email: String,
//   location: String,
//   phoneno: String,
//   bloodType: String,
//   organ: String,
//   urgencyLevel: String,
//   donorCode: String
// });

// module.exports = mongoose.model('MatchDonor', donorSchema);


const mongoose = require('mongoose');

const matchDonorSchema = new mongoose.Schema({
  name: String,
  age: Number,
  gender: String,
  email: String,
  location: String,
  phoneno: String,
  bloodType: String,
  organ: String,
  urgencyLevel: String,
  donorCode: String
}, { collection: 'matchdonors' }); // 🔸 Force collection name

module.exports = mongoose.model('MatchDonar', matchDonorSchema);