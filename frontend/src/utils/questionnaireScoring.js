import { QUESTIONNAIRE_QUESTIONS, QUESTIONNAIRE_VERSION } from '../config/questionnaireConfig.js';

/**
 * Largest Remainder Method (Hare-Niemeyer Method)
 * Mathematically guarantees normalized integer percentages sum to EXACTLY 100%.
 */
export function calculateExactPercentages(rawScores) {
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

  // Allocate +1 to highest remainders
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
 * Dedicated Questionnaire Scoring Engine (Frontend Prototype)
 * 
 * Rules & Principles:
 * 1. Explicit, transparent, documented scoring weights.
 * 2. Strict separation from ML confidence percentages.
 * 3. Exact 100% normalization via largest remainder method.
 * 4. Supports single-dosha, dual-dosha, Tridoshic, and inconclusive profiles.
 * 5. Clearly labeled as an unvalidated exploratory research prototype.
 */
export function calculateQuestionnaireScores(responses = {}) {
  let rawVata = 0;
  let rawPitta = 0;
  let rawKapha = 0;

  const sectionBreakdown = {
    skin: { vata: 0, pitta: 0, kapha: 0, answered: 0, total: 5 },
    constitution: { vata: 0, pitta: 0, kapha: 0, answered: 0, total: 5 },
    lifestyle: { vata: 0, pitta: 0, kapha: 0, answered: 0, total: 5 }
  };

  let answeredCount = 0;
  const totalQuestions = QUESTIONNAIRE_QUESTIONS.length;

  QUESTIONNAIRE_QUESTIONS.forEach((q) => {
    const selectedOptionId = responses[q.id];
    if (!selectedOptionId) return;

    const opt = q.options.find((o) => o.id === selectedOptionId);
    if (!opt || !opt.scores) return;

    answeredCount += 1;
    const { vata = 0, pitta = 0, kapha = 0 } = opt.scores;

    rawVata += vata;
    rawPitta += pitta;
    rawKapha += kapha;

    if (sectionBreakdown[q.sectionId]) {
      sectionBreakdown[q.sectionId].vata += vata;
      sectionBreakdown[q.sectionId].pitta += pitta;
      sectionBreakdown[q.sectionId].kapha += kapha;
      sectionBreakdown[q.sectionId].answered += 1;
    }
  });

  const totalPoints = rawVata + rawPitta + rawKapha;

  // Handle incomplete or empty questionnaires
  if (answeredCount === 0 || totalPoints === 0) {
    return {
      outcome: 'Incomplete Assessment',
      outcomeType: 'incomplete',
      answeredCount,
      totalQuestions,
      isComplete: false,
      rawScores: { vata: 0, pitta: 0, kapha: 0 },
      percentages: { vata: 0, pitta: 0, kapha: 0 },
      totalPoints: 0,
      scoringVersion: QUESTIONNAIRE_VERSION,
      scoringStatus: 'unvalidated_research_prototype',
      sectionBreakdown,
      explanation: 'No questions have been answered yet.',
      limitations: getScoringLimitationsNotice()
    };
  }

  // Exact 100% normalized percentages
  const percentages = calculateExactPercentages({ vata: rawVata, pitta: rawPitta, kapha: rawKapha });

  const doshaRankings = [
    { dosha: 'Vata', pct: percentages.vata, raw: rawVata },
    { dosha: 'Pitta', pct: percentages.pitta, raw: rawPitta },
    { dosha: 'Kapha', pct: percentages.kapha, raw: rawKapha }
  ].sort((a, b) => b.pct - a.pct || b.raw - a.raw);

  const [top, second, third] = doshaRankings;
  const spreadTopSecond = top.pct - second.pct;

  let outcome = '';
  let outcomeType = ''; // 'single' | 'dual' | 'tridoshic' | 'mixed' | 'inconclusive'
  let scoreRationale = '';

  // Transparent decision boundaries:
  if (answeredCount < Math.ceil(totalQuestions * 0.7)) {
    outcome = 'Inconclusive (Partially Answered)';
    outcomeType = 'inconclusive';
    scoreRationale = `Only ${answeredCount} of ${totalQuestions} questions were completed. At least 70% of questions are required for a reliable exploratory profile.`;
  } else if (top.pct >= 42 && spreadTopSecond >= 12) {
    // Distinct single dominant dosha
    outcome = top.dosha;
    outcomeType = 'single';
    scoreRationale = `${top.dosha} is distinctly dominant with ${top.pct}% of total indicator points, leading ${second.dosha} (${second.pct}%) by a ${spreadTopSecond}% margin (threshold: >= 12%).`;
  } else if (spreadTopSecond < 12 && third.pct < 26) {
    // Dual dosha (bi-doshic)
    outcome = `${top.dosha}-${second.dosha}`;
    outcomeType = 'dual';
    scoreRationale = `Dual-doshic constitution detected: ${top.dosha} (${top.pct}%) and ${second.dosha} (${second.pct}%) are closely matched within ${spreadTopSecond}% of each other, while ${third.dosha} (${third.pct}%) is substantially lower.`;
  } else if (top.pct <= 38 && third.pct >= 27) {
    // Tridoshic / Evenly Balanced Profile
    outcome = 'Tridoshic (Balanced Distribution)';
    outcomeType = 'tridoshic';
    scoreRationale = `All three doshas exhibit an evenly distributed balance (Vata: ${percentages.vata}%, Pitta: ${percentages.pitta}%, Kapha: ${percentages.kapha}%), within an 11% variance span across all indicators.`;
  } else {
    // Mixed / Inconclusive
    outcome = 'Mixed / Inconclusive';
    outcomeType = 'mixed';
    scoreRationale = `The responses show a varied combination (Top: ${top.dosha} ${top.pct}%, Second: ${second.dosha} ${second.pct}%, Third: ${third.dosha} ${third.pct}%) without a standard single or dual-dosha clustering.`;
  }

  return {
    outcome,
    outcomeType,
    isComplete: answeredCount === totalQuestions,
    answeredCount,
    totalQuestions,
    rawScores: {
      vata: rawVata,
      pitta: rawPitta,
      kapha: rawKapha
    },
    percentages,
    totalPoints,
    rankings: doshaRankings,
    scoringVersion: QUESTIONNAIRE_VERSION,
    scoringStatus: 'unvalidated_research_prototype',
    sectionBreakdown,
    explanation: scoreRationale,
    constitutionPrakritiDominance: getSectionDominance(sectionBreakdown.constitution),
    skinVikritiTendency: getSectionDominance(sectionBreakdown.skin),
    limitations: getScoringLimitationsNotice()
  };
}

function getSectionDominance(section) {
  if (!section || section.answered === 0) return 'Unanswered';
  const { vata, pitta, kapha } = section;
  if (vata > pitta && vata > kapha) return 'Vata Tendency';
  if (pitta > vata && pitta > kapha) return 'Pitta Tendency';
  if (kapha > vata && kapha > pitta) return 'Kapha Tendency';
  if (vata === pitta && vata > kapha) return 'Vata-Pitta Tendency';
  if (pitta === kapha && pitta > vata) return 'Pitta-Kapha Tendency';
  if (vata === kapha && vata > pitta) return 'Vata-Kapha Tendency';
  return 'Even Distribution';
}

export function getScoringLimitationsNotice() {
  return [
    'Unvalidated Prototype: This questionnaire scoring logic represents an experimental prototype developed for comparative study; it has not undergone clinical diagnostic validation.',
    'Prakriti vs. Vikriti: Self-reported answers can reflect acute temporary states (Vikriti) caused by climate or stress rather than inherent constitutional traits (Prakriti).',
    'Distinction from Vision AI: The questionnaire evaluates self-reported habits, whereas MobileNetV2 classifies visual photographic patterns without biophysically measuring skin moisture or lipids.'
  ];
}
