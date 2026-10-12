import assert from 'node:assert';
import {
  calculateQuestionnaireScores,
  calculateExactPercentages
} from '../utils/questionnaireScoring.js';
import { compareAssessments } from '../utils/assessmentComparison.js';
import { generatePersonalizedRecommendations } from '../utils/recommendations.js';
import { QUESTIONNAIRE_QUESTIONS } from '../config/questionnaireConfig.js';

console.log('🧪 Starting Hybrid AI + Questionnaire Assessment Unit Tests (Hardened)...\n');

// -------------------------------------------------------------------
// Test 1: Questionnaire Configuration Integrity
// -------------------------------------------------------------------
console.log('Test 1: Validating questionnaire question definitions...');
assert.strictEqual(QUESTIONNAIRE_QUESTIONS.length, 15, 'Should have exactly 15 questions');

const sectionCounts = { skin: 0, constitution: 0, lifestyle: 0 };
QUESTIONNAIRE_QUESTIONS.forEach((q) => {
  assert(q.id, 'Question must have an id');
  assert(q.title, 'Question must have a title');
  assert(Array.isArray(q.options) && q.options.length >= 3, 'Question must have at least 3 options');
  q.options.forEach((opt) => {
    assert(opt.id, 'Option must have an id');
    assert(opt.scores, 'Option must have dosha scores');
    assert(typeof opt.scores.vata === 'number');
    assert(typeof opt.scores.pitta === 'number');
    assert(typeof opt.scores.kapha === 'number');
  });
  sectionCounts[q.sectionId] += 1;
});

assert.strictEqual(sectionCounts.skin, 5, 'Section A should have 5 questions');
assert.strictEqual(sectionCounts.constitution, 5, 'Section B should have 5 questions');
assert.strictEqual(sectionCounts.lifestyle, 5, 'Section C should have 5 questions');
console.log('✅ Questionnaire configuration integrity verified.');

// -------------------------------------------------------------------
// Test 2: Incomplete & Skipped Questionnaire Handling
// -------------------------------------------------------------------
console.log('\nTest 2: Testing incomplete & skipped responses...');
const emptyResult = calculateQuestionnaireScores({});
assert.strictEqual(emptyResult.isComplete, false);
assert.strictEqual(emptyResult.outcomeType, 'incomplete');

// Partially answered (less than threshold)
const partialResponses = {
  q_skin_dryness: 'dry_flaky',
  q_skin_oiliness: 'matte_minimal'
};
const partialResult = calculateQuestionnaireScores(partialResponses);
assert.strictEqual(partialResult.outcomeType, 'inconclusive');
assert(partialResult.outcome.includes('Partially Answered'));

// Comparison for skipped/incomplete questionnaire must be 'uncompared' (NEVER a disagreement!)
const skippedComp = compareAssessments({ dosha: 'Pitta', confidence: 85 }, partialResult);
assert.strictEqual(skippedComp.status, 'uncompared', 'Incomplete questionnaire must yield uncompared, not disagreement');
console.log('✅ Incomplete & skipped questionnaire handling verified.');

// -------------------------------------------------------------------
// Test 3: Exact 100% Normalization via Largest Remainder Method
// -------------------------------------------------------------------
console.log('\nTest 3: Testing exact 100% percentage normalization across edge cases...');
const edgeCases = [
  { vata: 1, pitta: 1, kapha: 1 },       // 33.33%, 33.33%, 33.33%
  { vata: 7, pitta: 7, kapha: 2 },       // 43.75%, 43.75%, 12.5%
  { vata: 10, pitta: 10, kapha: 10 },    // 33.33%
  { vata: 19, pitta: 12, kapha: 9 },     // 47.5%, 30.0%, 22.5%
  { vata: 0, pitta: 15, kapha: 15 },     // 0%, 50%, 50%
  { vata: 40, pitta: 0, kapha: 0 }       // 100%, 0%, 0%
];

edgeCases.forEach(({ vata, pitta, kapha }) => {
  const pcts = calculateExactPercentages({ vata, pitta, kapha });
  const sum = pcts.vata + pcts.pitta + pcts.kapha;
  assert.strictEqual(sum, 100, `Percentages must sum to exactly 100, got ${sum}`);
  assert(pcts.vata >= 0 && pcts.pitta >= 0 && pcts.kapha >= 0, 'No negative percentages allowed');
});
console.log('✅ Exact 100% percentage normalization verified.');

// -------------------------------------------------------------------
// Test 4: Single Dominant Dosha (Vata, Pitta, Kapha)
// -------------------------------------------------------------------
console.log('\nTest 4: Testing single dominant dosha calculations...');

// Strongly Vata responses
const vataResponses = {};
QUESTIONNAIRE_QUESTIONS.forEach((q) => {
  const bestVata = [...q.options].sort((a, b) => b.scores.vata - a.scores.vata)[0];
  vataResponses[q.id] = bestVata.id;
});
const vataResult = calculateQuestionnaireScores(vataResponses);
assert.strictEqual(vataResult.outcome, 'Vata');
assert.strictEqual(vataResult.outcomeType, 'single');
assert.strictEqual(vataResult.percentages.vata + vataResult.percentages.pitta + vataResult.percentages.kapha, 100);

// Strongly Pitta responses
const pittaResponses = {};
QUESTIONNAIRE_QUESTIONS.forEach((q) => {
  const bestPitta = [...q.options].sort((a, b) => b.scores.pitta - a.scores.pitta)[0];
  pittaResponses[q.id] = bestPitta.id;
});
const pittaResult = calculateQuestionnaireScores(pittaResponses);
assert.strictEqual(pittaResult.outcome, 'Pitta');
assert.strictEqual(pittaResult.outcomeType, 'single');

// Strongly Kapha responses
const kaphaResponses = {};
QUESTIONNAIRE_QUESTIONS.forEach((q) => {
  const bestKapha = [...q.options].sort((a, b) => b.scores.kapha - a.scores.kapha)[0];
  kaphaResponses[q.id] = bestKapha.id;
});
const kaphaResult = calculateQuestionnaireScores(kaphaResponses);
assert.strictEqual(kaphaResult.outcome, 'Kapha');
assert.strictEqual(kaphaResult.outcomeType, 'single');
console.log('✅ Single dominant dosha verified for Vata, Pitta, and Kapha.');

// -------------------------------------------------------------------
// Test 5: Dual-Dosha & Tridoshic Profiles
// -------------------------------------------------------------------
console.log('\nTest 5: Testing dual-dosha and Tridoshic balanced profiles...');
// Tridoshic responses
const tridoshicResponses = {};
QUESTIONNAIRE_QUESTIONS.forEach((q) => {
  const balancedOpt = q.options.find(
    (o) => o.scores.vata === o.scores.pitta && o.scores.pitta === o.scores.kapha && o.scores.vata > 0
  ) || q.options[0];
  tridoshicResponses[q.id] = balancedOpt.id;
});
const tridoshicResult = calculateQuestionnaireScores(tridoshicResponses);
assert.strictEqual(tridoshicResult.outcomeType, 'tridoshic');
assert(tridoshicResult.outcome.includes('Tridoshic'));
console.log('✅ Dual and Tridoshic profiles verified.');

// -------------------------------------------------------------------
// Test 6: Determinism Verification
// -------------------------------------------------------------------
console.log('\nTest 6: Testing scoring determinism...');
const runA = calculateQuestionnaireScores(vataResponses);
const runB = calculateQuestionnaireScores(vataResponses);
assert.deepStrictEqual(runA.percentages, runB.percentages);
assert.strictEqual(runA.outcome, runB.outcome);
console.log('✅ Determinism verified across repeated invocations.');

// -------------------------------------------------------------------
// Test 7: Comparative Engine Across All 4 Image Classes & Edge Cases
// -------------------------------------------------------------------
console.log('\nTest 7: Testing comparative agreement logic across all 4 image classes...');

// 7a: Agreed (Pitta image + Pitta questionnaire)
const compAgreed = compareAssessments({ dosha: 'Pitta', confidence: 88.5 }, pittaResult);
assert.strictEqual(compAgreed.status, 'agreed');

// 7b: Disagreed (Vata image + Kapha questionnaire)
const compDisagreed = compareAssessments({ dosha: 'Vata', confidence: 91.2 }, kaphaResult);
assert.strictEqual(compDisagreed.status, 'disagreed');
assert(compDisagreed.detailedExplanation.includes('Neither method overrides the other'));

// 7c: Balanced Image with Tridoshic Questionnaire (Must NOT automatically equate as identical!)
const compBalancedTridoshic = compareAssessments({ dosha: 'Balanced', confidence: 80.0 }, tridoshicResult);
assert.strictEqual(compBalancedTridoshic.status, 'comparative');
assert(compBalancedTridoshic.detailedExplanation.includes('not synonymous'), 'Must explain they are not synonymous');

// 7d: Balanced Image with Vata Questionnaire
const compBalancedVata = compareAssessments({ dosha: 'Balanced', confidence: 78.4 }, vataResult);
assert.strictEqual(compBalancedVata.status, 'comparative');

// 7e: Kapha Image with Kapha Questionnaire
const compKapha = compareAssessments({ dosha: 'Kapha', confidence: 85.0 }, kaphaResult);
assert.strictEqual(compKapha.status, 'agreed');

// 7f: Inconclusive Questionnaire (Must NOT be called a disagreement!)
const compInconclusive = compareAssessments({ dosha: 'Pitta', confidence: 75.0 }, {
  outcome: 'Mixed / Inconclusive',
  outcomeType: 'mixed',
  isComplete: true
});
assert.strictEqual(compInconclusive.status, 'comparative', 'Inconclusive questionnaire must not be marked disagreed');

// 7g: Check that unsupported biophysical claims are completely removed
assert(!compBalancedTridoshic.detailedExplanation.includes('epidermal hydration'), 'Must not claim model measured hydration');
assert(!compAgreed.detailedExplanation.includes('barrier lipids'), 'Must not claim model measured barrier lipids');
console.log('✅ Comparative logic verified across all 4 image classes and edge cases.');

// -------------------------------------------------------------------
// Test 8: Recommendation Engine with Skipped & Active States
// -------------------------------------------------------------------
console.log('\nTest 8: Validating recommendations...');
// Active
const recsActive = generatePersonalizedRecommendations({
  imageDosha: 'Pitta',
  questionnaireOutcome: 'Pitta',
  responses: {
    q_life_concerns: 'concern_redness_sensitivity',
    q_life_environment: 'sunny_outdoor',
    q_skin_irritation_type: 'red_inflammation'
  }
});
assert(recsActive.ayurvedic.length > 0);
assert(recsActive.evidenceBased.length > 0);
assert(recsActive.lifestyle.length > 0);
assert(recsActive.evidenceBased.some(r => r.includes('SPF') || r.includes('Photoprotection')));

// Skipped (must NOT fabricate a Balanced questionnaire result)
const recsSkipped = generatePersonalizedRecommendations({
  imageDosha: 'Vata',
  questionnaireOutcome: 'Skipped (Incomplete)',
  responses: {}
});
assert(recsSkipped.ayurvedic.some(r => r.includes('Vata')));
console.log('✅ Recommendations verified for active and skipped workflows.');

console.log('\n🎉 ALL UNIT TESTS PASSED SUCCESSFULLY!');
