const express = require('express');
const bcrypt = require('bcryptjs');
const { signToken, verifyToken } = require('../config/jwt');
const User = require('../models/User');

const router = express.Router();

// 1. SIGNUP ROUTE
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if email is already taken
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save to Database
    user = new User({ name, email, password: hashedPassword });
    await user.save();

    // Secure token generation using environment JWT_SECRET
    const token = signToken({ id: user._id }, '30d');

    // Send the token AND user data back
    res.status(201).json({
      message: 'User created successfully!',
      token: token,
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (error) {
    console.error("Backend Signup Error:", error);
    if (error.message && error.message.includes('SECURITY CONFIGURATION ERROR')) {
      return res.status(500).json({ message: 'Authentication service configuration error.' });
    }
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// 2. LOGIN ROUTE (Now with JWT Token!)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate the security token without fallback
    const token = signToken({ id: user._id }, '30d');

    res.status(200).json({
      message: 'Login successful!',
      token: token,
      user: { id: user._id, name: user.name, email: user.email, skinType: user.skinType }
    });
  } catch (error) {
    console.error('Login error:', error);
    if (error.message && error.message.includes('SECURITY CONFIGURATION ERROR')) {
      return res.status(500).json({ message: 'Authentication service configuration error.' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// 3. GET MY PROFILE ROUTE (Dashboard profile fetch)
router.get('/me', async (req, res) => {
  try {
    let token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'No token' });

    if (token.startsWith('Bearer ')) token = token.slice(7).trim();

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user); // Sends user profile back to React
  } catch (error) {
    if (error.message && error.message.includes('SECURITY CONFIGURATION ERROR')) {
      return res.status(500).json({ message: 'Authentication service configuration error.' });
    }
    res.status(401).json({ message: 'Invalid token' });
  }
});

// 4. UPDATE DOSHA / SKIN TYPE ROUTE (Backward compatibility endpoint)
router.put('/update-dosha', async (req, res) => {
  try {
    let token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'No token' });

    if (token.startsWith('Bearer ')) token = token.slice(7).trim();

    const decoded = verifyToken(token);
    const { skinType } = req.body;

    if (!['Vata', 'Pitta', 'Kapha', 'Balanced'].includes(skinType)) {
      return res.status(400).json({ message: 'skinType must be Vata, Pitta, Kapha, or Balanced.' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      decoded.id,
      { skinType },
      { returnDocument: 'after' }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Skin type updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Update dosha error:', error);
    if (error.message && error.message.includes('SECURITY CONFIGURATION ERROR')) {
      return res.status(500).json({ message: 'Authentication service configuration error.' });
    }
    res.status(401).json({ message: 'Invalid token or server error' });
  }
});

module.exports = router;