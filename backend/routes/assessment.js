//backend\routes\assessment.js

const express = require('express');
const { createHash } = require('crypto');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Assessment = require('../models/Assessment');
const User = require('../models/User');
const {
  validateAndRecalculateScores,
  recalculateComparison,
  recalculateRecommendations
} = require('../services/assessmentService');

const isObjectId = (id) => typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id);
const isPlainObject = (value) => value && typeof value === 'object' &&
  !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;

// Keys are stable across retries of one assessment, but unique to each new scan.
// Fingerprints guard against accidentally reusing a key for different answers.
function makeFingerprint({ imagePrediction, imageConfidence, modelVersion, questionnaireResponses, isSkippedQuestionnaire }) {
  const sortedResponses = Object.fromEntries(
    Object.entries(questionnaireResponses).sort(([a], [b]) => a.localeCompare(b))
  );
  return createHash('sha256').update(JSON.stringify({
    imagePrediction, imageConfidence, modelVersion,
    questionnaireResponses: sortedResponses,
    isSkippedQuestionnaire
  })).digest('hex');
}

async function syncUserProfile(userId, imagePrediction, scores, updatePrimary) {
  // Only called *after* explicit consent + assessment persistence.
  const updates = {
    imageSkinType: imagePrediction,
    questionnaireSkinType: scores.isSkipped ? null : scores.outcome,
    lastAssessmentDate: new Date()
  };
  if (updatePrimary) {
    updates.skinType = scores.outcomeType === 'single' ? scores.outcome : imagePrediction;
  }
  try {
    await User.findByIdAndUpdate(userId, updates, { returnDocument: 'after' });
  } catch (err) {
    // Assessment was saved; do not fabricate a failure of the save itself.
    console.error('Assessment saved but profile synchronization failed:', err);
  }
}

/**
 * POST /api/assessments
 * Consent-gated, authenticated assessment storage with authoritative scoring.
 * New submissions require a unique per-session submissionKey. Repeated requests
 * with the same key and content return the same document; changed answers must
 * explicitly target their existingAssessmentId.
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (!isPlainObject(req.body)) return res.status(400).json({ message: 'Invalid JSON body.' });
    const {
      imagePrediction,
      imageConfidence,
      modelVersion = 'MobileNetV2-dosha-v1',
      questionnaireResponses = {},
      isSkippedQuestionnaire = false,
      userConsentGiven,
      existingAssessmentId,
      submissionKey,
      updateUserProfileSkinType = true
    } = req.body;

    if (userConsentGiven !== true) {
      return res.status(400).json({ message: 'Explicit consent is required to save assessment data.' });
    }
    if (!['Vata', 'Pitta', 'Kapha', 'Balanced'].includes(imagePrediction)) {
      return res.status(400).json({ message: 'Invalid image prediction.' });
    }
    if (typeof imageConfidence !== 'number' || !Number.isFinite(imageConfidence) ||
      imageConfidence < 0 || imageConfidence > 100) {
      return res.status(400).json({ message: 'Confidence must be a number between 0 and 100.' });
    }
    if (typeof isSkippedQuestionnaire !== 'boolean' ||
      typeof updateUserProfileSkinType !== 'boolean') {
      return res.status(400).json({ message: 'Invalid assessment flags.' });
    }
    if (typeof modelVersion !== 'string' || modelVersion.length > 100) {
      return res.status(400).json({ message: 'Invalid model version.' });
    }
    if (typeof submissionKey !== 'string' || !/^[a-z0-9_-]{8,128}$/i.test(submissionKey)) {
      return res.status(400).json({ message: 'A valid submissionKey is required for safe retries.' });
    }
    if (existingAssessmentId !== undefined && !isObjectId(existingAssessmentId)) {
      return res.status(400).json({ message: 'Invalid existingAssessmentId.' });
    }

    let scores;
    try {
      scores = validateAndRecalculateScores(questionnaireResponses, isSkippedQuestionnaire);
    } catch (err) {
      return res.status(err.statusCode === 400 ? 400 : 500).json({
        message: err.statusCode === 400 ? err.message : 'Invalid questionnaire.'
      });
    }
    const comparison = recalculateComparison(imagePrediction, imageConfidence, scores);
    const recommendations = recalculateRecommendations(imagePrediction, scores, questionnaireResponses);
    const fingerprint = makeFingerprint({
      imagePrediction, imageConfidence, modelVersion, questionnaireResponses, isSkippedQuestionnaire
    });
    const record = {
      userId: req.userId,
      submissionKey,
      requestFingerprint: fingerprint,
      imagePrediction,
      imageConfidence,
      imagePredictionOrigin: 'client_reported_prediction',
      modelVersion,
      questionnaireResponses,
      isSkippedQuestionnaire,
      questionnaireScores: {
        vata: scores.rawScores.vata,
        pitta: scores.rawScores.pitta,
        kapha: scores.rawScores.kapha,
        percentages: scores.percentages,
        totalScore: scores.totalScore
      },
      questionnaireOutcome: scores.outcome,
      scoringVersion: scores.scoringVersion,
      agreementStatus: comparison.status,
      agreementSummary: comparison.summary,
      uncertaintyNotes: comparison.uncertaintyNotes,
      recommendations,
      userConsentGiven: true,
      savedByUser: true
    };

    if (existingAssessmentId) {
      const doc = await Assessment.findOne({ _id: existingAssessmentId, userId: req.userId });
      if (!doc) return res.status(404).json({ message: 'Assessment not found.' });
      if (doc.submissionKey && doc.submissionKey !== submissionKey) {
        return res.status(409).json({ message: 'Assessment session key does not match.' });
      }
      Object.assign(doc, record);
      await doc.save();
      await syncUserProfile(req.userId, imagePrediction, scores, updateUserProfileSkinType);
      return res.status(200).json({ message: 'Assessment updated successfully.', assessment: doc });
    }

    // Idempotency is scoped to user + session key, not questionnaire outcome.
    const existing = await Assessment.findOne({ userId: req.userId, submissionKey });
    if (existing) {
      if (existing.requestFingerprint !== fingerprint) {
        return res.status(409).json({ message: 'Assessment answers changed. Edit the saved assessment using its ID.' });
      }
      return res.status(200).json({ message: 'Assessment already saved.', assessment: existing });
    }

    try {
      const doc = await Assessment.create(record);
      await syncUserProfile(req.userId, imagePrediction, scores, updateUserProfileSkinType);
      return res.status(201).json({ message: 'Assessment saved successfully.', assessment: doc });
    } catch (err) {
      // Handles two identical requests racing against the unique database index.
      if (err.code === 11000) {
        const concurrent = await Assessment.findOne({ userId: req.userId, submissionKey });
        if (concurrent?.requestFingerprint === fingerprint) {
          return res.status(200).json({ message: 'Assessment already saved.', assessment: concurrent });
        }
        return res.status(409).json({ message: 'Submission key already used for a different assessment.' });
      }
      throw err;
    }
  } catch (err) {
    console.error('Error saving assessment:', err);
    return res.status(500).json({ message: 'Failed to save assessment.' });
  }
});

/**
 * GET /api/assessments
 * Retrieves all assessments belonging to the authenticated user.
 * Enforces ownership verification to prevent unauthorized access.
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const assessments = await Assessment.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json(assessments);
  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({ message: 'Failed to fetch assessment history.' });
  }
});

/**
 * GET /api/assessments/latest
 * Retrieves the most recent assessment for the authenticated user.
 */
router.get('/latest', authMiddleware, async (req, res) => {
  try {
    const latest = await Assessment.findOne({ userId: req.userId })
      .sort({ createdAt: -1 })
      .lean();

    if (!latest) {
      return res.status(404).json({ message: 'No assessments found for this user.' });
    }

    res.json(latest);
  } catch (error) {
    console.error('Error fetching latest assessment:', error);
    res.status(500).json({ message: 'Failed to fetch latest assessment.' });
  }
});


/**
 * GET /api/assessments/stats/skin-types
 * Counts unique users by their latest saved AI skin type.
 */
router.get('/stats/skin-types', authMiddleware, async (req, res) => {
  try {
    const skinTypes = ['Vata', 'Pitta', 'Kapha', 'Balanced'];

    const results = await Assessment.aggregate([
      // Use only assessments saved with user consent
      {
        $match: {
          userConsentGiven: true,
          savedByUser: true,
          userId: { $exists: true, $ne: null },
          imagePrediction: { $in: skinTypes }
        }
      },

      // Latest assessment first
      {
        $sort: { createdAt: -1, _id: -1 }
      },

      // Count each user only once
      {
        $group: {
          _id: '$userId',
          skinType: { $first: '$imagePrediction' }
        }
      },

      // Count users in each skin type
      {
        $group: {
          _id: '$skinType',
          count: { $sum: 1 }
        }
      }
    ]);

    const counts = {
      Vata: 0,
      Pitta: 0,
      Kapha: 0,
      Balanced: 0
    };

    results.forEach((item) => {
      counts[item._id] = item.count;
    });

    const totalUsers = Object.values(counts).reduce(
      (sum, count) => sum + count,
      0
    );

    return res.json({
      counts,
      totalUsers
    });

  } catch (error) {
    console.error('Skin type statistics error:', error);

    return res.status(500).json({
      message: 'Failed to load skin type statistics.'
    });
  }
});


/**
 * GET /api/assessments/:id
 * Retrieves a specific assessment by ID, strictly verifying ownership.
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    if (!isObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid assessment ID.' });
    const assessment = await Assessment.findOne({
      _id: req.params.id,
      userId: req.userId // Strict ownership isolation
    }).lean();

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found or unauthorized.' });
    }

    res.json(assessment);
  } catch (error) {
    console.error('Error fetching assessment by ID:', error);
    res.status(500).json({ message: 'Error retrieving assessment.' });
  }
});

/**
 * DELETE /api/assessments/:id
 * Allows a user to delete their own assessment.
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (!isObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid assessment ID.' });
    const deleted = await Assessment.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Assessment not found or unauthorized.' });
    }

    res.json({ message: 'Assessment deleted successfully.' });
  } catch (error) {
    console.error('Error deleting assessment:', error);
    res.status(500).json({ message: 'Error deleting assessment.' });
  }
});

module.exports = router;
