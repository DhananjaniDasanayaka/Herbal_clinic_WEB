require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { getJwtSecret } = require('./config/jwt');

// Fail before opening a listening socket if authentication is misconfigured.
getJwtSecret();

const dns = require('node:dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

// Import routes
const authRoutes = require('./routes/auth');
const assessmentRoutes = require('./routes/assessment');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB connection error:', err));

// Route handlers
app.use('/api/auth', authRoutes);
app.use('/api/assessments', assessmentRoutes);

// Health check and root test routes
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ status: 'ok', service: 'HerbalClinic API', database: dbStatus });
});

app.get('/', (req, res) => {
  res.send('HerbalClinic API is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});