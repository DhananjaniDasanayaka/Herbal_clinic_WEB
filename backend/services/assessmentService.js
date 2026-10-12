const {
  QUESTIONNAIRE_VERSION,
  QUESTIONNAIRE_QUESTIONS,
  QUESTIONS_BY_ID
} = require('../config/questionnaireConfig');

/**
 * Largest Remainder Method (Hare-Niemeyer Method)
 * Mathematically guarantees normalized percentages sum to EXACTLY 100%.
 */
function calculateExactPercentages(rawScores) {
  const { vata, pitta, kapha } = rawScores;
  const total = vata + pitta + kapha;
  if (total === 0) {
    return { vata: 0, pitta: 0, kapha: 0 };
  }

  const exact = [
    { key: 'vata', val: (vata / total) * 100 },
    { key: 'pitta', val: (pitta / total) * 100 },
    { key: 'kapha', val: (kapha / total) * 100 }
  ];

  const floors = exact.map(item => ({
    key: item.key,
    floor: Math.floor(item.val),
    remainder: item.val - Math.floor(item.val)
  }));

  const sumFloor = floors.reduce((acc, item) => acc + item.floor, 0);
  const diff = 100 - sumFloor;

  // Distribute remainder differences to largest fractional parts
  floors.sort((a, b) => b.remainder - a.remainder);
  for (let i = 0; i < diff; i++) {
    floors[i].floor += 1;
  }

  const result = {};
  floors.forEach(item => {
    result[item.key] = item.floor;
  });

  return result;
}

/**
 * Server-Side Validation and Recalculation of Questionnaire Responses
 * Validates question and option IDs. Prevents client-forged scores.
 */
function validateAndRecalculateScores(responses = {}, isSkipped = false) {
  if (isSkipped || !responses || Object.keys(responses).length === 0) {
    return {
      isSkipped: true,
      outcome: 'Skipped (Incomplete)',
      outcomeType: 'incomplete',
      answeredCount: 0,
      totalQuestions: QUESTIONNAIRE_QUESTIONS.length,
      rawScores: { vata: 0, pitta: 0, kapha: 0 },
      percentages: { vata: 0, pitta: 0, kapha: 0 },
      totalScore: 0,
      scoringVersion: QUESTIONNAIRE_VERSION,
      scoringStatus: 'unvalidated_research_prototype',
      explanation: 'Questionnaire was skipped. No self-reported scores were generated.'
    };
  }

  // Validate every submitted response against authoritative question definitions
  let rawVata = 0;
  let rawPitta = 0;
  let rawKapha = 0;
  let answeredCount = 0;

  for (const [qId, optId] of Object.entries(responses)) {
    const question = QUESTIONS_BY_ID.get(qId);
    if (!question) {
      const err = new Error(`Validation Error: Unknown question ID "${qId}".`);
      err.statusCode = 400;
      throw err;
    }

    const option = question.options.find(opt => opt.id === optId);
    if (!option) {
      const err = new Error(`Validation Error: Invalid option ID "${optId}" for question "${qId}".`);
      err.statusCode = 400;
      throw err;
    }

    rawVata += (option.scores.vata || 0);
    rawPitta += (option.scores.pitta || 0);
    rawKapha += (option.scores.kapha || 0);
    answeredCount += 1;
  }

  const totalScore = rawVata + rawPitta + rawKapha;
  const percentages = calculateExactPercentages({ vata: rawVata, pitta: rawPitta, kapha: rawKapha });

  const doshaRankings = [
    { dosha: 'Vata', pct: percentages.vata, raw: rawVata },
    { dosha: 'Pitta', pct: percentages.pitta, raw: rawPitta },
    { dosha: 'Kapha', pct: percentages.kapha, raw: rawKapha }
  ].sort((a, b) => b.pct - a.pct || b.raw - a.raw);

  const [top, second, third] = doshaRankings;
  const spreadTopSecond = top.pct - second.pct;

  let outcome = '';
  let outcomeType = '';
  let explanation = '';

  const totalQuestions = QUESTIONNAIRE_QUESTIONS.length;
  if (answeredCount < Math.ceil(totalQuestions * 0.7)) {
    outcome = 'Inconclusive (Partially Answered)';
    outcomeType = 'inconclusive';
    explanation = `Completed ${answeredCount} of ${totalQuestions} questions. At least 70% required for an exploratory profile.`;
  } else if (top.pct >= 42 && spreadTopSecond >= 12) {
    outcome = top.dosha;
    outcomeType = 'single';
    explanation = `${top.dosha} is dominant (${top.pct}% indicator share) with a ${spreadTopSecond}% margin over ${second.dosha} (${second.pct}%).`;
  } else if (spreadTopSecond < 12 && third.pct < 26) {
    outcome = `${top.dosha}-${second.dosha}`;
    outcomeType = 'dual';
    explanation = `Dual-doshic distribution: ${top.dosha} (${top.pct}%) and ${second.dosha} (${second.pct}%) are closely matched, while ${third.dosha} (${third.pct}%) is substantially lower.`;
  } else if (top.pct <= 38 && third.pct >= 27) {
    outcome = 'Tridoshic (Balanced Distribution)';
    outcomeType = 'tridoshic';
    explanation = `Responses reflect an evenly balanced distribution across Vata (${percentages.vata}%), Pitta (${percentages.pitta}%), and Kapha (${percentages.kapha}%).`;
  } else {
    outcome = 'Mixed / Inconclusive';
    outcomeType = 'mixed';
    explanation = `Responses show a varied combination without distinct single or dual-dosha clustering.`;
  }

  return {
    isSkipped: false,
    outcome,
    outcomeType,
    answeredCount,
    totalQuestions,
    rawScores: { vata: rawVata, pitta: rawPitta, kapha: rawKapha },
    percentages,
    totalScore,
    rankings: doshaRankings,
    scoringVersion: QUESTIONNAIRE_VERSION,
    scoringStatus: 'unvalidated_research_prototype',
    explanation
  };
}

/**
 * Server-Side Comparative Agreement Calculation
 * Scientific honesty: Never claims MobileNetV2 measures hydration or lipids.
 * Treats model confidence as uncalibrated heuristic output.
 */
function recalculateComparison(imagePrediction, imageConfidence, calculatedScores) {
  const imgDosha = imagePrediction;
  const imgConf = Number(imageConfidence);
  const qOutcome = calculatedScores.outcome;

  const baselineUncertainty = 'MobileNetV2 classifies visual photographic patterns from training dataset associations and does not biophysically measure skin hydration, epidermal barrier lipids, or metabolic markers. Model confidence reflects neural network softmax output, not a clinically calibrated probability of correctness.';

  // 1. Skipped or incomplete questionnaire -> 'uncompared' (NEVER a disagreement!)
  if (calculatedScores.isSkipped || calculatedScores.outcomeType === 'incomplete') {
    return {
      status: 'uncompared',
      title: 'Single-Modal (Image Only)',
      summary: `Image analysis recorded as ${imgDosha} (${imgConf}% confidence). The questionnaire was skipped or incomplete, so comparative concordance cannot be evaluated.`,
      uncertaintyNotes: baselineUncertainty
    };
  }

  // 2. Inconclusive or mixed questionnaire -> 'comparative' (NEVER a confirmed disagreement!)
  if (calculatedScores.outcomeType === 'inconclusive' || calculatedScores.outcomeType === 'mixed') {
    return {
      status: 'comparative',
      title: 'Inconclusive Questionnaire Profile',
      summary: `Image model classified ${imgDosha} (${imgConf}% confidence), while self-reported wellness answers show an inconclusive or varied pattern. This reflects response diversity rather than a confirmed disagreement.`,
      uncertaintyNotes: baselineUncertainty
    };
  }

  // 3. Image is 'Balanced'
  if (imgDosha.toLowerCase() === 'balanced') {
    if (calculatedScores.outcomeType === 'tridoshic') {
      return {
        status: 'comparative',
        title: 'Dual-Modal Balance (Independent Metrics)',
        summary: `The image model classified the facial photograph as Balanced, while self-reported answers indicate Tridoshic balance. These measure two independent modalities (visual image classification vs. systemic wellness responses) and are not synonymous.`,
        uncertaintyNotes: baselineUncertainty
      };
    } else {
      return {
        status: 'comparative',
        title: 'Complementary Perspectives',
        summary: `Image analysis classified the photograph as Balanced, while self-reported wellness answers indicate a ${qOutcome} tendency. Both modalities are presented independently.`,
        uncertaintyNotes: baselineUncertainty
      };
    }
  }

  // 4. Exact dominant match
  if (qOutcome.toLowerCase() === imgDosha.toLowerCase()) {
    return {
      status: 'agreed',
      title: 'High Concordance (Agreed)',
      summary: `Both methods point toward ${imgDosha} characteristics. Image model classified ${imgDosha} (${imgConf}%), and questionnaire self-reports indicate ${imgDosha} dominance (${calculatedScores.percentages[imgDosha.toLowerCase()]}%).`,
      uncertaintyNotes: baselineUncertainty
    };
  }

  // 5. Partial concordance (image matches one component of dual dosha)
  if (qOutcome.toLowerCase().includes(imgDosha.toLowerCase())) {
    return {
      status: 'partial',
      title: 'Partial Concordance',
      summary: `Image analysis classified ${imgDosha} (${imgConf}%), aligning with the ${imgDosha} facet of your dual-doshic (${qOutcome}) profile.`,
      uncertaintyNotes: baselineUncertainty
    };
  }

  // 6. Questionnaire is Tridoshic, but Image detected a specific Dosha
  if (calculatedScores.outcomeType === 'tridoshic') {
    return {
      status: 'comparative',
      title: 'Visual Classification vs. Constitutional Balance',
      summary: `Image model classified ${imgDosha} (${imgConf}%), while questionnaire self-reports indicate balanced Tridoshic distribution across all three doshas.`,
      uncertaintyNotes: baselineUncertainty
    };
  }

  // 7. Divergent
  return {
    status: 'disagreed',
    title: 'Divergent Assessment',
    summary: `Image classification indicated ${imgDosha} (${imgConf}%), whereas self-reported questionnaire indicated ${qOutcome}. Photographic appearance under ambient lighting can differ from systemic constitutional habits. Neither overrides the other.`,
    uncertaintyNotes: baselineUncertainty
  };
}

/**
 * Server-Side Authoritative Recommendations Generation
 * Strictly distinguishes Ayurvedic traditions from evidence-based dermatology.
 */
function recalculateRecommendations(imagePrediction, calculatedScores, responses = {}) {
  const primaryConcern = responses['q_life_concerns'] || 'concern_maintenance';
  const environment = responses['q_life_environment'] || 'temperate_moderate';
  const irritationType = responses['q_skin_irritation_type'] || 'rare_breakouts';
  const sleepHours = responses['q_life_sleep_hours'] || '7_to_8';

  const ayurvedic = [];
  const evidenceBased = [];
  const lifestyle = [];

  const qOutcome = calculatedScores.outcome || '';
  const isVata = qOutcome.includes('Vata') || imagePrediction === 'Vata';
  const isPitta = qOutcome.includes('Pitta') || imagePrediction === 'Pitta';
  const isKapha = qOutcome.includes('Kapha') || imagePrediction === 'Kapha';

  // 1. Traditional Ayurvedic Recommendations
  if (isVata) {
    ayurvedic.push('Mukha Abhyanga: Perform a gentle 3-minute evening facial massage using warm, cold-pressed sesame or almond oil to nourish dry tissue.');
    ayurvedic.push('Warm Botanical Cleanse: Wash with gentle herbal preparations like licorice root (Yashtimadhu) or hydrating oat infusions.');
    ayurvedic.push('Internal Agni Warming: Sip warm water infused with fresh ginger slices and fennel seeds throughout the day.');
  }

  if (isPitta) {
    ayurvedic.push('Sheetali Cooling Mist: Spritz skin twice daily with pure steam-distilled rose water (Gulab Jal) or aloe vera juice.');
    ayurvedic.push('Pitta-Pacifying Mask: Apply a cooling weekly paste of pure sandalwood (Chandan) and vetiver (Khus) to soothe skin heat.');
    ayurvedic.push('Cooling Hydration: Drink coconut water or room-temperature water infused with crushed coriander seeds.');
  }

  if (isKapha) {
    ayurvedic.push('Ubtan Gentle Exfoliation: Use a mild paste of chickpea flour (Besan) and a pinch of turmeric (Haridra) 2–3 times a week.');
    ayurvedic.push('Herbal Steam: Inhale warm herbal steam with a pinch of tulsi or mint to open congested facial micro-channels (Srotas).');
    ayurvedic.push('Stimulating Teas: Enjoy warming CCF tea (cumin, coriander, fennel) with a touch of black pepper.');
  }

  if (!isVata && !isPitta && !isKapha) {
    ayurvedic.push('Harmonious Care: Cleanse with mild rose and aloe formulations, maintaining natural physiological equilibrium.');
    ayurvedic.push('Seasonal Balance: Shift topical oils with the seasons (lighter jojoba in warm months, nourishing sesame in winter).');
  }

  // 2. Evidence-Based Dermatological Advice
  evidenceBased.push('Broad-Spectrum UV Photoprotection: Apply a daily broad-spectrum SPF 30–50 sunscreen every morning, reapplying before direct outdoor exposure.');

  if (primaryConcern === 'concern_dryness_aging' || irritationType === 'flaking_roughness') {
    evidenceBased.push('Barrier Lipid Replenishment: Look for moisturizers containing ceramides, cholesterol, and free fatty acids to seal trans-epidermal water loss (TEWL).');
    evidenceBased.push('Humectant Layering: Apply glycerin or hyaluronic acid serums to damp skin immediately prior to an occlusive barrier cream.');
  } else if (primaryConcern === 'concern_redness_sensitivity' || irritationType === 'red_inflammation') {
    evidenceBased.push('Vascular Soothing Actives: Incorporate anti-inflammatory ingredients like 2–5% Niacinamide, Madecassoside (Centella Asiatica), or Azelaic Acid.');
    evidenceBased.push('Hypoallergenic Protocol: Eliminate synthetic fragrances and drying denatured alcohol; always patch-test new products behind the ear for 48 hours.');
  } else if (primaryConcern === 'concern_oil_acne' || irritationType === 'cystic_congestion') {
    evidenceBased.push('Lipophilic Salicylic Acid (BHA): Use a gentle 0.5%–1.5% BHA exfoliant 2 evenings per week to dissolve trapped sebum inside pores.');
    evidenceBased.push('Non-Comedogenic Hydration: Use an oil-free, gel-based moisturizer with dimethicone or squalane; avoid heavy comedogenic oils on breakout-prone areas.');
  } else {
    evidenceBased.push('Barrier Maintenance: Use a mild, non-stripping cleanser with a skin-neutral pH (5.0–5.5) to preserve the acid mantle.');
    evidenceBased.push('Antioxidant Defense: Apply a stable 10% Vitamin C (or derivative) serum in the morning under sunscreen.');
  }

  if (environment === 'dry_ac_office') {
    evidenceBased.push('Indoor Humidity Management: Consider an office or bedside cool-mist humidifier (aiming for 45–55% ambient humidity) to counter parching air conditioning.');
  } else if (environment === 'sunny_outdoor') {
    evidenceBased.push('Photoaging Defense: Complement sunscreen with UV-protective hats and sunglasses to protect delicate periorbital tissue.');
  }

  // 3. Lifestyle Guidance
  if (sleepHours === 'under_6') {
    lifestyle.push('Sleep Recovery Target: Aim to extend sleep window by 30–45 minutes to support nocturnal growth hormone secretion for dermal cellular turnover.');
  }
  lifestyle.push('Circadian Meal Cadence: Consistent meal timings stabilize blood glucose curves, which directly modulates facial sebum production.');
  lifestyle.push('Mindful De-escalation: Practice 5–10 minutes of slow diaphragmatic breathing (e.g. alternate nostril breathing) before bed to lower systemic cortisol.');

  return {
    ayurvedic,
    evidenceBased,
    lifestyle
  };
}

module.exports = {
  calculateExactPercentages,
  validateAndRecalculateScores,
  recalculateComparison,
  recalculateRecommendations
};
