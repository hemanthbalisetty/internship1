const express = require('express');
const router = express.Router();
const MatchDonar = require('../models/MatchDonar'); // Make sure this path is correct

// Register a new match donor
router.post('/', async (req, res) => {
  try {
    const { name, age, gender, email, location, phoneno, bloodType, organ, urgencyLevel } = req.body;

    if (!name || !age || !gender || !email || !location || !phoneno || !bloodType || !organ || !urgencyLevel) {
      return res.status(400).json({ message: 'All required fields must be filled.' });
    }

    const donorCode = 'DNR-' + Math.random().toString(36).substr(2, 6).toUpperCase();

    const newDonor = new MatchDonar({
      name,
      age,
      gender,
      email,
      location,
      phoneno,
      bloodType,
      organ,
      urgencyLevel,
      donorCode
    });

    await newDonor.save();
    res.status(201).json({ message: '✅ Match donor registered successfully', donor: newDonor });
  } catch (err) {
    console.error('❌ Error registering match donor:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all match donors
router.get('/', async (req, res) => {
  try {
    const donors = await MatchDonar.find();
    res.status(200).json(donors);
  } catch (err) {
    console.error('❌ Error fetching match donors:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;