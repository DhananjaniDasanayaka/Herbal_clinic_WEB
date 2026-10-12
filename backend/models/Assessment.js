const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Stable per-session idempotency key. Optional for older assessments created
  // before the migration; all NEW assessments must supply one through the API.
  submissionKey: { type: String, trim: true, maxlength: 128 },
  requestFingerprint: { type: String },

  // ML Image Classification (Facial image itself is NOT stored)
  imagePrediction: {
    type: String,
    required: true,
    enum: ['Vata', 'Pitta', 'Kapha', 'Balanced', 'Unknown']
  },
  imageConfidence: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  imagePredictionOrigin: {
    type: String,
    enum: ['client_reported_prediction', 'server_verified'],
    default: 'client_reported_prediction' // Explicitly documents client-mediated Flask inference
  },
  modelVersion: {
    type: String,
    default: 'MobileNetV2-dosha-v1'
  },

  // Authoritative Server-Recalculated Questionnaire Results
  questionnaireResponses: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isSkippedQuestionnaire: {
    type: Boolean,
    default: false
  },
  questionnaireScores: {
    vata: { type: Number, default: 0 },
    pitta: { type: Number, default: 0 },
    kapha: { type: Number, default: 0 },
    percentages: {
      vata: { type: Number, default: 0 },
      pitta: { type: Number, default: 0 },
      kapha: { type: Number, default: 0 }
    },
    totalScore: { type: Number, default: 0 }
  },
  questionnaireOutcome: {
    type: String,
    required: true
  },
  scoringVersion: {
    type: String,
    default: '1.0.0-prototype'
  },

  // Authoritative Server-Recalculated Comparative Analysis
  agreementStatus: {
    type: String,
    enum: ['agreed', 'partial', 'disagreed', 'comparative', 'uncompared'],
    required: true
  },
  agreementSummary: {
    type: String,
    default: ''
  },
  uncertaintyNotes: {
    type: String,
    default: ''
  },

  // Authoritative Server-Generated Recommendations
  recommendations: {
    ayurvedic: [{ type: String }],
    evidenceBased: [{ type: String }],
    lifestyle: [{ type: String }]
  },

  // Informed User Consent
  userConsentGiven: {
    type: Boolean,
    required: true,
    default: false,
    validate: { validator: (value) => value === true, message: 'Explicit user consent is required.' }
  },
  savedByUser: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for queries by user and date
assessmentSchema.index({ userId: 1, createdAt: -1 });
// Unique only for documents that actually have a submission key (legacy-safe).
assessmentSchema.index(
  { userId: 1, submissionKey: 1 },
  { unique: true, partialFilterExpression: { submissionKey: { $type: 'string' } } }
);

module.exports = mongoose.model('Assessment', assessmentSchema);
