const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 
const User = require('../models/User'); 

const router = express.Router();

// 1. SIGNUP ROUTE
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if email is already taken
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save to Database
    user = new User({ name, email, password: hashedPassword });
    await user.save();

    // 🚨 NEW: Generate the VIP Token immediately after signing up!
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET || 'secretkey', 
      { expiresIn: '30d' }
    );

    // Send the token AND user data back
    res.status(201).json({ 
      message: 'User created successfully!', 
      token: token, 
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (error) {
    console.error("Backend Signup Error:", error); // This will print exact errors to your terminal!
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// 2. LOGIN ROUTE (Now with JWT Token!)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate the security token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '30d' });

    res.status(200).json({ 
      message: 'Login successful!',
      token: token, 
      user: { id: user._id, name: user.name, skinType: user.skinType }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// 3. GET MY PROFILE ROUTE (This is what your Dashboard asks for!)
router.get('/me', async (req, res) => {
  try {
    let token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'No token' });

    if (token.startsWith('Bearer ')) token = token.slice(7, token.length).trimLeft();

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json(user); // Sends { _id, name, email, skinType } back to React
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;