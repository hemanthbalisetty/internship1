const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Organization = require('../models/Organization');

const generateToken = (org) => {
  return jwt.sign({ id: org._id, orgId: org.id }, process.env.JWT_SECRET, { expiresIn: '2h' });
};

exports.registerUser = async (req, res) => {
  const { name, id, email, password, confirmPassword, location } = req.body;

  if (!name || !id || !email || !password || !confirmPassword || !location)
    return res.status(400).json({ message: 'Please fill all fields' });

  if (password !== confirmPassword)
    return res.status(400).json({ message: 'Passwords do not match' });

  const existing = await Organization.findOne({ id });
  if (existing)
    return res.status(400).json({ message: 'ID already registered' });

  const hashedPassword = await bcrypt.hash(password, 10);

  const newOrg = new Organization({ name, id, email, password: hashedPassword, location });
  await newOrg.save();

  const token = generateToken(newOrg);
  res.status(201).json({ message: 'Registration successful', token });
};

exports.loginUser = async (req, res) => {
  const { id, password } = req.body;

  const org = await Organization.findOne({ id });
  if (!org)
    return res.status(404).json({ message: 'Organization not found' });

  const isMatch = await bcrypt.compare(password, org.password);
  if (!isMatch)
    return res.status(401).json({ message: 'Invalid password' });

  const token = generateToken(org);

  res
    .cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    })
    .status(200)
    .json({
      message: 'Login successful',
      token,
      hospital: {
        _id: org._id,
        name: org.name,
        id: org.id,
        hospitalId: org.id,
        location: org.location,
      }
    });
};