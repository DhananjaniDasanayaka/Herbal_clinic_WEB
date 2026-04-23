require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import the auth routes you just created
const authRoutes = require('./routes/auth'); 

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.log('❌ MongoDB connection error:', err));

// Tell Express to use our auth routes whenever the URL starts with /api/auth
app.use('/api/auth', authRoutes);

// A simple test route
app.get('/', (req, res) => {
  res.send('HerbalClinic API is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});