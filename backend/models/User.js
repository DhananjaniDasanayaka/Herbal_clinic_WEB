const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true
  },
  password: { 
    type: String, 
    required: true 
  },
  // Backward-compatible primary skin type
  skinType: { 
    type: String, 
    default: null 
  },
  // Structured multi-modal assessment classifications
  imageSkinType: {
    type: String,
    default: null
  },
  questionnaireSkinType: {
    type: String,
    default: null
  },
  lastAssessmentDate: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);