const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Organization = require('../models/Organisation');

// Load environment variables
require('dotenv').config();

// ==============================
// REGISTER ORGANIZATION
// ==============================
router.post('/register', async (req, res) => {
  try {
    const { name, id, email, password, confirmPassword, location } = req.body;

    if (!name || !id || !email || !password || !confirmPassword || !location) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const existing = await Organization.findOne({ id });
    if (existing) {
      return res.status(400).json({ message: 'Organization ID already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newOrg = new Organization({
      name,
      id,
      email,
      password: hashedPassword,
      location,
    });

    await newOrg.save();
    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// ==============================
// LOGIN ORGANIZATION
// ==============================
router.post('/login', async (req, res) => {
  try {
    const { id, password } = req.body;

    if (!id || !password) {
      return res.status(400).json({ message: 'Please enter both ID and password' });
    }

    const org = await Organization.findOne({ id });
    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const isMatch = await bcrypt.compare(password, org.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: org._id, orgId: org.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send JWT as cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,      // Set to true in production with HTTPS
      sameSite: 'lax',    // 'none' if frontend and backend are on different domains with HTTPS
      maxAge: 3600000     // 1 hour
    });

    res.status(200).json({
      message: 'Login successful',
      organization: org.name,
      orgId: org.id
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;