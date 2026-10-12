/**
 * HerbalClinic assessment API regression tests.
 * IMPORTANT: Refuses to run without an explicitly configured, separate TEST database.
 * Run from backend/: npm test
 */
require('dotenv').config();
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const { randomUUID } = require('crypto');
const authRoutes = require('../routes/auth');
const assessmentRoutes = require('../routes/assessment');
const Assessment = require('../models/Assessment');
const User = require('../models/User');
const { getJwtSecret } = require('../config/jwt');
const { validateAndRecalculateScores } = require('../services/assessmentService');

function assertSafeTestDatabase() {
  const uri = process.env.MONGO_TEST_URI;
  if (!uri) throw new Error('MONGO_TEST_URI is required. Tests will never use MONGO_URI.');
  const parsed = new URL(uri);
  const dbName = decodeURIComponent(parsed.pathname.replace(/^\//, ''));
  if (!/test/i.test(dbName)) {
    throw new Error('MONGO_TEST_URI must specify a database name containing "test", e.g. herbalclinic_test.');
  }
  if (process.env.MONGO_URI && process.env.MONGO_URI === uri) {
    throw new Error('MONGO_TEST_URI must not equal MONGO_URI.');
  }
  if (process.env.MONGO_URI) {
    const applicationUri = new URL(process.env.MONGO_URI);
    const applicationDbName = decodeURIComponent(applicationUri.pathname.replace(/^\//, ''));
    if (dbName === applicationDbName && parsed.host === applicationUri.host) {
      throw new Error('Test and application databases must differ.');
    }
  }
  return uri;
}

async function run() {
  // Perform *all* configuration validation before connecting or writing.
  getJwtSecret();
  const uri = assertSafeTestDatabase();
  const testId = `hc_${Date.now()}_${randomUUID().slice(0, 8)}`;
  let server;
  let baseUrl;

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    // Ensure the unique compound key is created before testing concurrent saves.
    await Assessment.init();

    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use('/api/assessments', assessmentRoutes);
    server = app.listen(0, '127.0.0.1');
    await new Promise((resolve) => server.once('listening', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
    console.log('🧪 Running isolated HerbalClinic API tests in:', mongoose.connection.name);

    async function request(method, path, body, token) {
      const resp = await fetch(`${baseUrl}${path}`, {
        method,
        headers: {
          ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {})
      });
      const json = await resp.json();
      return { status: resp.status, json };
    }

    async function register(name) {
      const email = `${testId}_${name}@example.invalid`;
      const r = await request('POST', '/api/auth/signup', {
        name, email, password: 'test-password-only-123!'
      });
      assert.equal(r.status, 201, JSON.stringify(r.json));
      return { id: r.json.user.id, email, token: r.json.token };
    }

    const a = await register('alpha');
    const b = await register('beta');
    console.log('✓ Signup and signing with a configured JWT secret');

    const login = await request('POST', '/api/auth/login', { email: a.email, password: 'test-password-only-123!' });
    assert.equal(login.status, 200);
    assert.equal(login.json.user.email, a.email);
    console.log('✓ Login preserves user email');

    const badToken = await request('GET', '/api/assessments', undefined, `${a.token}tampered`);
    assert.equal(badToken.status, 401);
    console.log('✓ Tampered token rejected');

    const answers = {
      q_skin_dryness: 'dry_flaky', q_skin_oiliness: 'matte_minimal',
      q_skin_sensitivity: 'reactive_dry', q_skin_irritation_type: 'flaking_roughness',
      q_skin_seasons: 'winter_cold_wind', q_const_temp: 'cold_sensitive',
      q_const_sleep: 'light_restless', q_const_frame: 'slender_light',
      q_const_activity: 'quick_variable', q_const_digestion: 'irregular_appetite',
      q_life_stress: 'anxiety_worry', q_life_sleep_hours: 'under_6',
      q_life_skincare_routine: 'gentle_hydrating', q_life_environment: 'dry_ac_office',
      q_life_concerns: 'concern_dryness_aging'
    };
    assert.equal(validateAndRecalculateScores(answers).outcome, 'Vata');

    const basePayload = {
      submissionKey: randomUUID(),
      imagePrediction: 'Vata', imageConfidence: 88,
      userConsentGiven: true,
      questionnaireResponses: answers
    };
    assert.equal((await request('POST', '/api/assessments', { ...basePayload, userConsentGiven: false }, a.token)).status, 400);
    assert.equal((await request('POST', '/api/assessments', { ...basePayload, questionnaireResponses: { bad: 'fake' } }, a.token)).status, 400);
    assert.equal((await request('POST', '/api/assessments', {
      ...basePayload, isSkippedQuestionnaire: true
    }, a.token)).status, 400);
    assert.equal((await request('POST', '/api/assessments', {
      ...basePayload, questionnaireResponses: []
    }, a.token)).status, 400);
    console.log('✓ Consent, invalid response, and contradictory skip rejected');

    const first = await request('POST', '/api/assessments', {
      ...basePayload,
      questionnaireOutcome: 'Forged Kapha', questionnaireScores: { kapha: 999 }
    }, a.token);
    assert.equal(first.status, 201, JSON.stringify(first.json));
    assert.equal(first.json.assessment.questionnaireOutcome, 'Vata');
    assert.equal(first.json.assessment.userConsentGiven, true);
    const assessmentId = first.json.assessment._id;
    const pct = first.json.assessment.questionnaireScores.percentages;
    assert.equal(pct.vata + pct.pitta + pct.kapha, 100);
    console.log('✓ Authoritative backend scoring');

    const retry = await request('POST', '/api/assessments', basePayload, a.token);
    assert.equal(retry.status, 200);
    assert.equal(retry.json.assessment._id, assessmentId);
    console.log('✓ Same submission key and same answers deduplicated');

    const edited = { ...answers, q_skin_dryness: 'balanced_normal' };
    const differentNewSession = await request('POST', '/api/assessments', {
      ...basePayload, questionnaireResponses: edited, submissionKey: randomUUID()
    }, a.token);
    assert.equal(differentNewSession.status, 201);
    assert.notEqual(differentNewSession.json.assessment._id, assessmentId);
    console.log('✓ Different answers with same dosha outcome are not deduplicated');

    const reusedKey = await request('POST', '/api/assessments', {
      ...basePayload, questionnaireResponses: edited
    }, a.token);
    assert.equal(reusedKey.status, 409);
    const update = await request('POST', '/api/assessments', {
      ...basePayload, questionnaireResponses: edited, existingAssessmentId: assessmentId
    }, a.token);
    assert.equal(update.status, 200);
    assert.equal(update.json.assessment._id, assessmentId);
    console.log('✓ Editing updates same record, mismatched retry rejected');

    const malformedId = await request('POST', '/api/assessments', {
      ...basePayload, existingAssessmentId: 'not-an-id'
    }, a.token);
    assert.equal(malformedId.status, 400);
    const foreignUpdate = await request('POST', '/api/assessments', {
      ...basePayload, existingAssessmentId: assessmentId, submissionKey: randomUUID()
    }, b.token);
    assert.equal(foreignUpdate.status, 404);
    const foreignRead = await request('GET', `/api/assessments/${assessmentId}`, undefined, b.token);
    assert.equal(foreignRead.status, 404);
    console.log('✓ Invalid ID and cross-user access correctly denied');

    const skip = await request('POST', '/api/assessments', {
      submissionKey: randomUUID(), imagePrediction: 'Balanced',
      imageConfidence: 77.5, isSkippedQuestionnaire: true,
      questionnaireResponses: {}, userConsentGiven: true
    }, a.token);
    assert.equal(skip.status, 201);
    assert.equal(skip.json.assessment.agreementStatus, 'uncompared');
    console.log('✓ Skipped questionnaire stored as uncompared');

    const user = await User.findById(a.id);
    assert.equal(user.imageSkinType, 'Balanced');
    assert(user.lastAssessmentDate instanceof Date);
    console.log('✓ User profile synchronized only by the consent-gated save route');
    console.log('✅ All isolated integration tests passed');
  } finally {
    try {
      // Only records with this test run's unique email prefix are removed.
      // Also cleans up accounts when registration succeeded but the assertion failed.
      if (mongoose.connection.readyState === 1) {
        const createdUsers = await User.find({ email: { $regex: `^${testId}_` } }).select('_id').lean();
        const createdIds = createdUsers.map(user => user._id);
        if (createdIds.length) {
          await Assessment.deleteMany({ userId: { $in: createdIds } });
          await User.deleteMany({ _id: { $in: createdIds } });
        }
      }
    } finally {
      if (server) await new Promise(resolve => server.close(resolve));
      if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    }
  }
}

run().catch(err => {
  console.error('❌ Test run failed:', err.message);
  process.exitCode = 1;
});
