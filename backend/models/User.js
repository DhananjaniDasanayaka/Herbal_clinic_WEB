const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true // Prevents two accounts with the same email
  },
  password: { 
    type: String, 
    required: true 
  },
  skinType: { 
    type: String, 
    default: null // We will update this after they take the assessment!
  }
}, { timestamps: true }); // Automatically adds 'createdAt' dates

module.exports = mongoose.model('User', userSchema);