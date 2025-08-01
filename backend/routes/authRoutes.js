const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Organisation = require('../models/Organisation');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Set in .env

// Register Route
router.post('/register', async (req, res) => {
  const { name, id, email, password, location } = req.body;

  try {
    const existingOrg = await Organisation.findOne({ id });
    if (existingOrg) {
      return res.status(409).json({ message: 'User ID already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newOrg = new Organisation({ name, id, email, password: hashedPassword, location });
    await newOrg.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { id, password } = req.body;

  try {
    const organisation = await Organisation.findOne({ id });
    if (!organisation) {
      return res.status(401).json({ message: 'Invalid ID or password' });
    }

    const isMatch = await bcrypt.compare(password, organisation.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid ID or password' });
    }

    const token = jwt.sign({ userId: organisation._id, hospitalId: organisation.id }, JWT_SECRET, { expiresIn: '1h' });

    res
      .cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'None', 
      })
      .status(200)
      .json({
        message: 'Login successful',
        token,
        hospital: {
          _id: organisation._id,
          name: organisation.name,
          hospitalId: organisation.id,
          location: organisation.location
        }
      });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get organisation by Mongo _id
router.get('/by-mongo-id/:mongoId', async (req, res) => {
  try {
    const organisation = await Organisation.findById(req.params.mongoId);
    if (!organisation) {
      return res.status(404).json({ message: 'Organisation not found' });
    }
    res.json(organisation);
  } catch (err) {
    console.error('Fetch by Mongo ID Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get organisation by hospital ID (e.g., HOS003)
router.get('/hospital-id/:id', async (req, res) => {
  try {
    const organisation = await Organisation.findOne({ id: req.params.id });
    if (!organisation) {
      return res.status(404).json({ message: 'Organisation not found' });
    }
    res.json(organisation);
  } catch (err) {
    console.error('Fetch Organisation by hospitalId Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;