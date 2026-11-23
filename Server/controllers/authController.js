const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler, createError } = require('../utils/helpers');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const userData = (u) => ({
  _id: u._id, name: u.name, email: u.email, role: u.role, phone: u.phone, address: u.address,
});

const emailRegex = /^\S+@\S+\.\S+$/;

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) throw createError('Name, email and password are required');
  if (!emailRegex.test(email)) throw createError('Please enter a valid email');
  if (password.length < 6) throw createError('Password must be at least 6 characters');

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw createError('Email is already registered');

  const user = await User.create({ name, email, password });
  res.status(201).json({ token: generateToken(user._id), user: userData(user) });
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw createError('Email and password are required');

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await user.matchPassword(password))) throw createError('Invalid email or password', 401);

  res.json({ token: generateToken(user._id), user: userData(user) });
});

// GET /api/auth/profile
exports.getProfile = asyncHandler(async (req, res) => {
  res.json(userData(req.user));
});

// PUT /api/auth/profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { name, phone, address, password } = req.body;

  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (address) user.address = { ...user.address.toObject(), ...address };
  if (password) {
    if (password.length < 6) throw createError('Password must be at least 6 characters');
    user.password = password;
  }
  await user.save();
  res.json({ token: generateToken(user._id), user: userData(user) });
});
