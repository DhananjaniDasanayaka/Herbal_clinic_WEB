/**
 * Backend Authoritative Questionnaire Configuration
 * 
 * Standardized across Section A (Skin), Section B (Constitution), Section C (Lifestyle).
 * Contains trusted scoring weights for server-side validation and recalculation.
 */

const QUESTIONNAIRE_VERSION = '1.0.0-prototype';

const QUESTIONNAIRE_SECTIONS = [
  {
    id: 'skin',
    title: 'Section A: Skin Characteristics',
    subtitle: 'Observable topical tendencies & barrier behavior'
  },
  {
    id: 'constitution',
    title: 'Section B: Traditional Ayurvedic Constitution',
    subtitle: 'Stable baseline traits (Prakriti markers)'
  },
  {
    id: 'lifestyle',
    title: 'Section C: Lifestyle & Wellness Context',
    subtitle: 'Current environment, routines & primary concerns'
  }
];

const QUESTIONNAIRE_QUESTIONS = [
  // SECTION A: SKIN CHARACTERISTICS (5 questions)
  {
    id: 'q_skin_dryness',
    sectionId: 'skin',
    category: 'changeable_skin',
    title: 'Typical Skin Dryness & Moisture Retention',
    options: [
      { id: 'dry_flaky', label: 'Tight, rough, or easily flaky', scores: { vata: 3, pitta: 0, kapha: 0 } },
      { id: 'balanced_normal', label: 'Comfortable, neither tight nor greasy', scores: { vata: 1, pitta: 1, kapha: 1 } },
      { id: 'sensitive_dry', label: 'Warm with localized dry patches', scores: { vata: 1, pitta: 2, kapha: 0 } },
      { id: 'rarely_dry', label: 'Rarely dry; feels naturally supple or thick', scores: { vata: 0, pitta: 0, kapha: 3 } }
    ]
  },
  {
    id: 'q_skin_oiliness',
    sectionId: 'skin',
    category: 'changeable_skin',
    title: 'Oiliness, Sebum & Pore Visibility',
    options: [
      { id: 'matte_minimal', label: 'Very low oil; fine or barely visible pores', scores: { vata: 3, pitta: 0, kapha: 0 } },
      { id: 'tzone_moderate', label: 'Moderate oil in T-zone (forehead, nose, chin)', scores: { vata: 0, pitta: 3, kapha: 0 } },
      { id: 'consistent_oily', label: 'Consistent overall shine; larger or noticeable pores', scores: { vata: 0, pitta: 0, kapha: 3 } },
      { id: 'balanced_even', label: 'Even balance with smooth, subtle natural glow', scores: { vata: 1, pitta: 1, kapha: 1 } }
    ]
  },
  {
    id: 'q_skin_sensitivity',
    sectionId: 'skin',
    category: 'changeable_skin',
    title: 'Sensitivity & Reactivity to New Products',
    options: [
      { id: 'reactive_red', label: 'Highly reactive; flares red, stings, or heats up quickly', scores: { vata: 0, pitta: 3, kapha: 0 } },
      { id: 'reactive_dry', label: 'Prone to stinging from dehydration or micro-cracks', scores: { vata: 3, pitta: 0, kapha: 0 } },
      { id: 'calm_resilient', label: 'Very resilient and tolerant to most ingredients', scores: { vata: 0, pitta: 0, kapha: 3 } },
      { id: 'occasionally_reactive', label: 'Occasionally reactive only to harsh surfactants', scores: { vata: 1, pitta: 1, kapha: 1 } }
    ]
  },
  {
    id: 'q_skin_irritation_type',
    sectionId: 'skin',
    category: 'changeable_skin',
    title: 'Dominant Irritation or Breakout Patterns',
    options: [
      { id: 'flaking_roughness', label: 'Dry flaking, dullness, or fine crêpey texture', scores: { vata: 3, pitta: 0, kapha: 0 } },
      { id: 'red_inflammation', label: 'Red inflammation, whiteheads, rosacea flare-ups or burning', scores: { vata: 0, pitta: 3, kapha: 0 } },
      { id: 'cystic_congestion', label: 'Deep blackheads, congested pores, or cystic sluggish spots', scores: { vata: 0, pitta: 0, kapha: 3 } },
      { id: 'rare_breakouts', label: 'Rarely breaks out; skin remains clear and calm', scores: { vata: 1, pitta: 1, kapha: 1 } }
    ]
  },
  {
    id: 'q_skin_seasons',
    sectionId: 'skin',
    category: 'changeable_skin',
    title: 'Seasonal Environmental Reactions',
    options: [
      { id: 'winter_cold_wind', label: 'Cold, dry, or windy winter air', scores: { vata: 3, pitta: 0, kapha: 0 } },
      { id: 'summer_heat_sun', label: 'Intense summer heat, humidity, or direct sun', scores: { vata: 0, pitta: 3, kapha: 0 } },
      { id: 'spring_damp', label: 'Damp, cold, or highly humid transitional weather', scores: { vata: 0, pitta: 0, kapha: 3 } },
      { id: 'minimal_seasonal', label: 'Relatively consistent across seasonal changes', scores: { vata: 1, pitta: 1, kapha: 1 } }
    ]
  },

  // SECTION B: TRADITIONAL AYURVEDIC CONSTITUTION (5 questions)
  {
    id: 'q_const_temp',
    sectionId: 'constitution',
    category: 'stable_constitution',
    title: 'General Temperature Preference & Cold Tolerance',
    options: [
      { id: 'cold_sensitive', label: 'Naturally cold hands & feet; craves warmth', scores: { vata: 3, pitta: 0, kapha: 0 } },
      { id: 'heat_intolerant', label: 'Naturally warm body; dislikes excessive heat', scores: { vata: 0, pitta: 3, kapha: 0 } },
      { id: 'moderate_adaptable', label: 'Good cold tolerance, dislikes damp chill', scores: { vata: 0, pitta: 0, kapha: 3 } },
      { id: 'balanced_thermo', label: 'Evenly balanced thermal comfort year-round', scores: { vata: 1, pitta: 1, kapha: 1 } }
    ]
  },
  {
    id: 'q_const_sleep',
    sectionId: 'constitution',
    category: 'stable_constitution',
    title: 'Natural Sleep Patterns & Awakening Tendency',
    options: [
      { id: 'light_restless', label: 'Light, interrupted sleeper', scores: { vata: 3, pitta: 0, kapha: 0 } },
      { id: 'moderate_vivid', label: 'Sound sleeper (6–7 hours); vivid dreams', scores: { vata: 0, pitta: 3, kapha: 0 } },
      { id: 'deep_heavy', label: 'Deep, heavy sleeper (8+ hours)', scores: { vata: 0, pitta: 0, kapha: 3 } },
      { id: 'regular_sound', label: 'Consistent 7–8 hours; wakes refreshed', scores: { vata: 1, pitta: 1, kapha: 1 } }
    ]
  },
  {
    id: 'q_const_frame',
    sectionId: 'constitution',
    category: 'stable_constitution',
    title: 'Physical Constitution & Body Bone Structure',
    options: [
      { id: 'slender_light', label: 'Slender, lean, or light frame', scores: { vata: 3, pitta: 0, kapha: 0 } },
      { id: 'medium_athletic', label: 'Medium build; well-proportioned musculature', scores: { vata: 0, pitta: 3, kapha: 0 } },
      { id: 'sturdy_broad', label: 'Sturdy, broad frame; solid bone structure', scores: { vata: 0, pitta: 0, kapha: 3 } },
      { id: 'moderate_average', label: 'Evenly balanced, average bone structure', scores: { vata: 1, pitta: 1, kapha: 1 } }
    ]
  },
  {
    id: 'q_const_activity',
    sectionId: 'constitution',
    category: 'stable_constitution',
    title: 'General Activity Pace & Mental Rhythm',
    options: [
      { id: 'quick_variable', label: 'Quick, enthusiastic; works in bursts', scores: { vata: 3, pitta: 0, kapha: 0 } },
      { id: 'focused_driven', label: 'Determined, goal-oriented, organized pace', scores: { vata: 0, pitta: 3, kapha: 0 } },
      { id: 'calm_steady', label: 'Calm, steady, methodical; high stamina', scores: { vata: 0, pitta: 0, kapha: 3 } },
      { id: 'harmonious_pace', label: 'Adaptive balance between focus and rest', scores: { vata: 1, pitta: 1, kapha: 1 } }
    ]
  },
  {
    id: 'q_const_digestion',
    sectionId: 'constitution',
    category: 'stable_constitution',
    title: 'Appetite Regularity & Digestive Habit',
    options: [
      { id: 'irregular_appetite', label: 'Irregular appetite (variable hunger, gas)', scores: { vata: 3, pitta: 0, kapha: 0 } },
      { id: 'strong_punctual', label: 'Strong, intense hunger; irritable if delayed', scores: { vata: 0, pitta: 3, kapha: 0 } },
      { id: 'slow_steady', label: 'Slow, steady appetite; can skip meals easily', scores: { vata: 0, pitta: 0, kapha: 3 } },
      { id: 'balanced_digestion', label: 'Consistent, smooth digestion', scores: { vata: 1, pitta: 1, kapha: 1 } }
    ]
  },

  // SECTION C: LIFESTYLE & WELLNESS CONTEXT (5 questions)
  {
    id: 'q_life_stress',
    sectionId: 'lifestyle',
    category: 'lifestyle_context',
    title: 'Current Stress Level & Emotional Response',
    options: [
      { id: 'anxiety_worry', label: 'Nervous tension, overthinking, feeling scattered', scores: { vata: 2, pitta: 0, kapha: 0 } },
      { id: 'frustration_urgency', label: 'High intensity, impatience, irritability', scores: { vata: 0, pitta: 2, kapha: 0 } },
      { id: 'withdrawn_sluggish', label: 'Fatigue, low motivation, emotional eating', scores: { vata: 0, pitta: 0, kapha: 2 } },
      { id: 'low_stress_peaceful', label: 'Generally calm, grounded, managing smoothly', scores: { vata: 1, pitta: 1, kapha: 1 } }
    ]
  },
  {
    id: 'q_life_sleep_hours',
    sectionId: 'lifestyle',
    category: 'lifestyle_context',
    title: 'Average Sleep Duration Over the Past Month',
    options: [
      { id: 'under_6', label: 'Under 6 hours per night (Sleep deficit)', scores: { vata: 2, pitta: 1, kapha: 0 } },
      { id: '6_to_7', label: '6 to 7 hours per night (Moderate)', scores: { vata: 1, pitta: 1, kapha: 0 } },
      { id: '7_to_8', label: '7 to 8.5 hours per night (Optimal)', scores: { vata: 1, pitta: 1, kapha: 1 } },
      { id: 'over_8_5', label: 'More than 8.5–9 hours with grogginess', scores: { vata: 0, pitta: 0, kapha: 2 } }
    ]
  },
  {
    id: 'q_life_skincare_routine',
    sectionId: 'lifestyle',
    category: 'lifestyle_context',
    title: 'Current Daily Skincare Habits & Complexity',
    options: [
      { id: 'minimal_inconsistent', label: 'Minimalist / Inconsistent (Water only)', scores: { vata: 1, pitta: 1, kapha: 1 } },
      { id: 'gentle_hydrating', label: 'Gentle hydration focused (Cleanser, oils)', scores: { vata: 2, pitta: 0, kapha: 0 } },
      { id: 'clarifying_active', label: 'Clarifying & Targeted (Salicylic acid, SPF)', scores: { vata: 0, pitta: 1, kapha: 2 } },
      { id: 'calming_cooling', label: 'Calming & Cooling (Rose water, aloe)', scores: { vata: 0, pitta: 2, kapha: 0 } }
    ]
  },
  {
    id: 'q_life_environment',
    sectionId: 'lifestyle',
    category: 'lifestyle_context',
    title: 'Primary Environmental & Daily Exposure',
    options: [
      { id: 'dry_ac_office', label: 'High indoor AC / central heating & screen time', scores: { vata: 2, pitta: 0, kapha: 0 } },
      { id: 'sunny_outdoor', label: 'Frequent direct sunlight or tropical heat', scores: { vata: 0, pitta: 2, kapha: 0 } },
      { id: 'humid_urban', label: 'Humid, rainy, or high-pollution urban setting', scores: { vata: 0, pitta: 0, kapha: 2 } },
      { id: 'temperate_moderate', label: 'Temperate climate with balanced indoor/outdoor', scores: { vata: 1, pitta: 1, kapha: 1 } }
    ]
  },
  {
    id: 'q_life_concerns',
    sectionId: 'lifestyle',
    category: 'lifestyle_context',
    title: 'Primary Skincare Priority or Concern',
    options: [
      { id: 'concern_dryness_aging', label: 'Dryness, tight flaking, dullness, fine lines', scores: { vata: 2, pitta: 0, kapha: 0 } },
      { id: 'concern_redness_sensitivity', label: 'Redness, burning, reactive flare-ups', scores: { vata: 0, pitta: 2, kapha: 0 } },
      { id: 'concern_oil_acne', label: 'Clogged pores, stubborn blackheads, excess oil', scores: { vata: 0, pitta: 0, kapha: 2 } },
      { id: 'concern_maintenance', label: 'General preventive wellness and natural glow', scores: { vata: 1, pitta: 1, kapha: 1 } }
    ]
  }
];

// Helper maps for O(1) lookups
const QUESTIONS_BY_ID = new Map(QUESTIONNAIRE_QUESTIONS.map(q => [q.id, q]));

module.exports = {
  QUESTIONNAIRE_VERSION,
  QUESTIONNAIRE_SECTIONS,
  QUESTIONNAIRE_QUESTIONS,
  QUESTIONS_BY_ID
};
