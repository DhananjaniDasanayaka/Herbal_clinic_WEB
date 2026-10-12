/**
 * Reusable Questionnaire Configuration
 * 
 * Organized into 3 distinct sections:
 *  - Section A: Skin Characteristics (Observable topical patterns)
 *  - Section B: Traditional Ayurvedic Constitution Indicators (Stable Prakriti baseline)
 *  - Section C: Lifestyle & Wellness (Changeable Vikriti context & skincare habits)
 * 
 * Transparent, documented scoring weights:
 *  - Constitution indicators carry higher baseline weight (3 pts) for Prakriti classification.
 *  - Observable skin characteristics carry moderate weight (2 pts).
 *  - Lifestyle factors provide contextual modifiers (1 pt) and drive personalized recommendations.
 */

//frontend\src\config\questionnaireConfig.js

export const QUESTIONNAIRE_VERSION = '1.0.0-prototype';

export const QUESTIONNAIRE_SECTIONS = [
  {
    id: 'skin',
    title: 'Section A: Skin Characteristics',
    subtitle: 'Observable topical tendencies & barrier behavior',
    description: 'These questions explore your day-to-day facial skin behavior, oil production, and environmental reactivity.'
  },
  {
    id: 'constitution',
    title: 'Section B: Traditional Ayurvedic Constitution',
    subtitle: 'Stable baseline traits (Prakriti markers)',
    description: 'In Ayurveda, Prakriti represents your inherent constitutional baseline. These indicators examine enduring physical and metabolic traits.'
  },
  {
    id: 'lifestyle',
    title: 'Section C: Lifestyle & Wellness Context',
    subtitle: 'Current environment, routines & primary concerns',
    description: 'Current lifestyle habits, environmental exposures, and acute concerns help contextualize how your skin is responding today.'
  }
];

export const QUESTIONNAIRE_QUESTIONS = [
  // ==========================================
  // SECTION A: SKIN CHARACTERISTICS (5 questions)
  // ==========================================
  {
    id: 'q_skin_dryness',
    sectionId: 'skin',
    category: 'changeable_skin',
    title: 'Typical Skin Dryness & Moisture Retention',
    hint: 'How does your bare skin feel 1–2 hours after gentle washing without creams?',
    options: [
      {
        id: 'dry_flaky',
        label: 'Tight, rough, or easily flaky',
        detail: 'Skin drinks up moisturizer immediately and quickly feels dry or parched again.',
        scores: { vata: 3, pitta: 0, kapha: 0 }
      },
      {
        id: 'balanced_normal',
        label: 'Comfortable, neither tight nor greasy',
        detail: 'Skin retains moisture well throughout the day with minimal tightness.',
        scores: { vata: 1, pitta: 1, kapha: 1 }
      },
      {
        id: 'sensitive_dry',
        label: 'Warm with localized dry patches',
        detail: 'Experiences occasional tautness accompanied by slight flushing or heat.',
        scores: { vata: 1, pitta: 2, kapha: 0 }
      },
      {
        id: 'rarely_dry',
        label: 'Rarely dry; feels naturally supple or thick',
        detail: 'Natural moisture barrier remains intact even without heavy hydration.',
        scores: { vata: 0, pitta: 0, kapha: 3 }
      }
    ]
  },
  {
    id: 'q_skin_oiliness',
    sectionId: 'skin',
    category: 'changeable_skin',
    title: 'Oiliness, Sebum & Pore Visibility',
    hint: 'Assess how shine and sebum distribute across your face by mid-afternoon.',
    options: [
      {
        id: 'matte_minimal',
        label: 'Very low oil; fine or barely visible pores',
        detail: 'Rarely gets shiny; may appear dull or matte without hydration.',
        scores: { vata: 3, pitta: 0, kapha: 0 }
      },
      {
        id: 'tzone_moderate',
        label: 'Moderate oil in T-zone (forehead, nose, chin)',
        detail: 'Cheeks remain normal or slightly warm while center of face produces mild shine.',
        scores: { vata: 0, pitta: 3, kapha: 0 }
      },
      {
        id: 'consistent_oily',
        label: 'Consistent overall shine; larger or noticeable pores',
        detail: 'Face produces abundant natural sebum; requires blotting or mattifying.',
        scores: { vata: 0, pitta: 0, kapha: 3 }
      },
      {
        id: 'balanced_even',
        label: 'Even balance with smooth, subtle natural glow',
        detail: 'Healthy lipid barrier with no excessive oiliness or parched zones.',
        scores: { vata: 1, pitta: 1, kapha: 1 }
      }
    ]
  },
  {
    id: 'q_skin_sensitivity',
    sectionId: 'skin',
    category: 'changeable_skin',
    title: 'Sensitivity & Reactivity to New Products',
    hint: 'When introducing active skincare or changing water/climate:',
    options: [
      {
        id: 'reactive_red',
        label: 'Highly reactive; flares red, stings, or heats up quickly',
        detail: 'Easily triggers burning sensations, redness, or contact flushing.',
        scores: { vata: 0, pitta: 3, kapha: 0 }
      },
      {
        id: 'reactive_dry',
        label: 'Prone to stinging from dehydration or micro-cracks',
        detail: 'Reactivity comes as dry irritation or rough patches rather than deep redness.',
        scores: { vata: 3, pitta: 0, kapha: 0 }
      },
      {
        id: 'calm_resilient',
        label: 'Very resilient and tolerant to most ingredients',
        detail: 'Rarely experiences stinging, allergic flushing, or acute reactions.',
        scores: { vata: 0, pitta: 0, kapha: 3 }
      },
      {
        id: 'occasionally_reactive',
        label: 'Occasionally reactive only to harsh surfactants or synthetic fragrances',
        detail: 'Generally stable when adhering to gentle skincare routines.',
        scores: { vata: 1, pitta: 1, kapha: 1 }
      }
    ]
  },
  {
    id: 'q_skin_irritation_type',
    sectionId: 'skin',
    category: 'changeable_skin',
    title: 'Dominant Irritation or Breakout Patterns',
    hint: 'When your skin is unhappy, what manifestation is most common?',
    options: [
      {
        id: 'flaking_roughness',
        label: 'Dry flaking, dullness, or fine crêpey texture',
        detail: 'Skin loses elasticity, appears weathered or ash-toned.',
        scores: { vata: 3, pitta: 0, kapha: 0 }
      },
      {
        id: 'red_inflammation',
        label: 'Red inflammation, whiteheads, rosacea flare-ups or burning',
        detail: 'Warm to the touch with acute erythematous spots or sensitivity.',
        scores: { vata: 0, pitta: 3, kapha: 0 }
      },
      {
        id: 'cystic_congestion',
        label: 'Deep blackheads, congested pores, or cystic sluggish spots',
        detail: 'Sebaceous congestion that takes a long time to heal or turn over.',
        scores: { vata: 0, pitta: 0, kapha: 3 }
      },
      {
        id: 'rare_breakouts',
        label: 'Rarely breaks out; skin remains clear and calm',
        detail: 'Occasional mild spot that resolves quickly without leaving marks.',
        scores: { vata: 1, pitta: 1, kapha: 1 }
      }
    ]
  },
  {
    id: 'q_skin_seasons',
    sectionId: 'skin',
    category: 'changeable_skin',
    title: 'Seasonal Environmental Reactions',
    hint: 'Which weather condition causes the most noticeable distress to your skin?',
    options: [
      {
        id: 'winter_cold_wind',
        label: 'Cold, dry, or windy winter air',
        detail: 'Air conditioning and dry winter winds worsen flakiness, chapping, and tightness.',
        scores: { vata: 3, pitta: 0, kapha: 0 }
      },
      {
        id: 'summer_heat_sun',
        label: 'Intense summer heat, humidity, or direct sun',
        detail: 'Sun exposure rapidly causes redness, sunburn, heat rash, or irritation.',
        scores: { vata: 0, pitta: 3, kapha: 0 }
      },
      {
        id: 'spring_damp',
        label: 'Damp, cold, or highly humid transitional weather',
        detail: 'Leads to sluggish lymph, water retention, dull puffiness, or clogged pores.',
        scores: { vata: 0, pitta: 0, kapha: 3 }
      },
      {
        id: 'minimal_seasonal',
        label: 'Relatively consistent across seasonal changes',
        detail: 'Skin adapts comfortably with minor seasonal skincare adjustments.',
        scores: { vata: 1, pitta: 1, kapha: 1 }
      }
    ]
  },

  // ==========================================
  // SECTION B: TRADITIONAL AYURVEDIC CONSTITUTION (5 questions)
  // ==========================================
  {
    id: 'q_const_temp',
    sectionId: 'constitution',
    category: 'stable_constitution',
    title: 'General Temperature Preference & Cold Tolerance',
    hint: 'Ayurvedic marker for Agni (metabolic heat) and circulation tendency.',
    options: [
      {
        id: 'cold_sensitive',
        label: 'Naturally cold hands & feet; craves warmth and hot baths',
        detail: 'Very sensitive to drafts and air-conditioning; feels chilly easily.',
        scores: { vata: 3, pitta: 0, kapha: 0 }
      },
      {
        id: 'heat_intolerant',
        label: 'Naturally warm body; dislikes excessive heat and sweats easily',
        detail: 'Prefers cool rooms, light clothing, and refreshing iced or room-temp drinks.',
        scores: { vata: 0, pitta: 3, kapha: 0 }
      },
      {
        id: 'moderate_adaptable',
        label: 'Good cold tolerance, but dislikes damp chill; steady internal warmth',
        detail: 'Comfortable in most temperatures; dislikes wet, soggy weather.',
        scores: { vata: 0, pitta: 0, kapha: 3 }
      },
      {
        id: 'balanced_thermo',
        label: 'Evenly balanced thermal comfort year-round',
        detail: 'Neither overly chilly nor prone to overheating easily.',
        scores: { vata: 1, pitta: 1, kapha: 1 }
      }
    ]
  },
  {
    id: 'q_const_sleep',
    sectionId: 'constitution',
    category: 'stable_constitution',
    title: 'Natural Sleep Patterns & Awakening Tendency',
    hint: 'Enduring sleep characteristics when no external alarm clock is set.',
    options: [
      {
        id: 'light_restless',
        label: 'Light, interrupted sleeper; tends to wake at small noises',
        detail: 'Mind can race at night; difficulty settling; wakes feeling variable energy.',
        scores: { vata: 3, pitta: 0, kapha: 0 }
      },
      {
        id: 'moderate_vivid',
        label: 'Sound sleeper (6–7 hours); vivid, active, or purposeful dreams',
        detail: 'Wakes up alert and ready for the day; can feel irritated if sleep is cut short.',
        scores: { vata: 0, pitta: 3, kapha: 0 }
      },
      {
        id: 'deep_heavy',
        label: 'Deep, heavy sleeper (8+ hours); slow and groggy upon waking',
        detail: 'Rarely wakes up during the night; loves relaxing mornings in bed.',
        scores: { vata: 0, pitta: 0, kapha: 3 }
      },
      {
        id: 'regular_sound',
        label: 'Consistent 7–8 hours; wakes refreshed and calm',
        detail: 'Reliable, restorative sleep cycle with steady circadian rhythm.',
        scores: { vata: 1, pitta: 1, kapha: 1 }
      }
    ]
  },
  {
    id: 'q_const_frame',
    sectionId: 'constitution',
    category: 'stable_constitution',
    title: 'Physical Constitution & Body Bone Structure',
    hint: 'Traditional Ayurvedic marker of physical frame (Asthi Dhatu).',
    options: [
      {
        id: 'slender_light',
        label: 'Slender, lean, or light frame; prominent joints or wrists',
        detail: 'Finds it challenging to gain weight; naturally quick and agile physique.',
        scores: { vata: 3, pitta: 0, kapha: 0 }
      },
      {
        id: 'medium_athletic',
        label: 'Medium build; well-proportioned musculature and athletic frame',
        detail: 'Maintains weight with moderate effort; responds quickly to physical training.',
        scores: { vata: 0, pitta: 3, kapha: 0 }
      },
      {
        id: 'sturdy_broad',
        label: 'Sturdy, broad-shouldered or curvaceous frame; solid bone structure',
        detail: 'Natural endurance and physical strength; gains weight easily, loses it slowly.',
        scores: { vata: 0, pitta: 0, kapha: 3 }
      },
      {
        id: 'moderate_average',
        label: 'Evenly balanced, average bone structure and musculature',
        detail: 'Comfortably balanced proportions without pronounced lean or heavy traits.',
        scores: { vata: 1, pitta: 1, kapha: 1 }
      }
    ]
  },
  {
    id: 'q_const_activity',
    sectionId: 'constitution',
    category: 'stable_constitution',
    title: 'General Activity Pace & Mental Rhythm',
    hint: 'How you naturally approach movement, projects, and daily tasks.',
    options: [
      {
        id: 'quick_variable',
        label: 'Quick, enthusiastic, multitasking; works in creative bursts',
        detail: 'Enjoys variety and spontaneous movement; can tire abruptly when energy dips.',
        scores: { vata: 3, pitta: 0, kapha: 0 }
      },
      {
        id: 'focused_driven',
        label: 'Determined, goal-oriented, organized, and competitive pace',
        detail: 'Thrives on leadership, clear execution, and focused intensity.',
        scores: { vata: 0, pitta: 3, kapha: 0 }
      },
      {
        id: 'calm_steady',
        label: 'Calm, steady, methodical; high stamina and endurance',
        detail: 'Prefers steady routines; rarely rushed; calm and loyal approach to life.',
        scores: { vata: 0, pitta: 0, kapha: 3 }
      },
      {
        id: 'harmonious_pace',
        label: 'Adaptive balance between focus, creativity, and calm patience',
        detail: 'Shifts comfortably between active projects and peaceful relaxation.',
        scores: { vata: 1, pitta: 1, kapha: 1 }
      }
    ]
  },
  {
    id: 'q_const_digestion',
    sectionId: 'constitution',
    category: 'stable_constitution',
    title: 'Appetite Regularity & Digestive Habit',
    hint: 'Assessment of digestive fire (Jatharagni) rhythm.',
    options: [
      {
        id: 'irregular_appetite',
        label: 'Irregular appetite (sometimes ravenous, sometimes forgets to eat)',
        detail: 'Prone to gas, bloating, or dry transit when skipping warm meals.',
        scores: { vata: 3, pitta: 0, kapha: 0 }
      },
      {
        id: 'strong_punctual',
        label: 'Strong, intense hunger; becomes irritable or dizzy if meals delayed',
        detail: 'Rapid metabolism; feels uncomfortable heat or acidity if eating spicy foods.',
        scores: { vata: 0, pitta: 3, kapha: 0 }
      },
      {
        id: 'slow_steady',
        label: 'Slow, steady appetite; can comfortably skip meals without distress',
        detail: 'May feel heavy or sluggish after rich, oily, or heavy meals.',
        scores: { vata: 0, pitta: 0, kapha: 3 }
      },
      {
        id: 'balanced_digestion',
        label: 'Consistent, smooth digestion with regular comfortable hunger',
        detail: 'Enjoys regular meals without noticeable bloating, burning, or sluggishness.',
        scores: { vata: 1, pitta: 1, kapha: 1 }
      }
    ]
  },

  // ==========================================
  // SECTION C: LIFESTYLE & WELLNESS CONTEXT (5 questions)
  // ==========================================
  {
    id: 'q_life_stress',
    sectionId: 'lifestyle',
    category: 'lifestyle_context',
    title: 'Current Stress Level & Emotional Response',
    hint: 'How mental tension manifests in your body and mindset currently.',
    options: [
      {
        id: 'anxiety_worry',
        label: 'Nervous tension, overthinking, feeling scattered or overwhelmed',
        detail: 'Stress shows up as restlessness, sleep difficulty, and dry skin tightness.',
        scores: { vata: 2, pitta: 0, kapha: 0 }
      },
      {
        id: 'frustration_urgency',
        label: 'High intensity, impatience, irritability, or perfectionism',
        detail: 'Stress causes internal heat, flushed face, headache, or skin flare-ups.',
        scores: { vata: 0, pitta: 2, kapha: 0 }
      },
      {
        id: 'withdrawn_sluggish',
        label: 'Fatigue, low motivation, emotional comfort eating, or feeling stuck',
        detail: 'Stress leads to heaviness, sluggish circulation, and dull facial tone.',
        scores: { vata: 0, pitta: 0, kapha: 2 }
      },
      {
        id: 'low_stress_peaceful',
        label: 'Generally calm, grounded, and managing daily demands smoothly',
        detail: 'Stress levels are well-managed through current lifestyle habits.',
        scores: { vata: 1, pitta: 1, kapha: 1 }
      }
    ]
  },
  {
    id: 'q_life_sleep_hours',
    sectionId: 'lifestyle',
    category: 'lifestyle_context',
    title: 'Average Sleep Duration Over the Past Month',
    hint: 'Quality sleep is essential for dermal cellular repair and hormonal balance.',
    options: [
      {
        id: 'under_6',
        label: 'Under 6 hours per night (Sleep deficit)',
        detail: 'May elevate cortisol, accelerate epidermal dehydration, and compromise barrier function.',
        scores: { vata: 2, pitta: 1, kapha: 0 }
      },
      {
        id: '6_to_7',
        label: '6 to 7 hours per night (Moderate)',
        detail: 'Functioning adequately, but could benefit from deeper restorative rest.',
        scores: { vata: 1, pitta: 1, kapha: 0 }
      },
      {
        id: '7_to_8',
        label: '7 to 8.5 hours per night (Optimal)',
        detail: 'Healthy circadian recovery supporting skin elasticity and cell turnover.',
        scores: { vata: 1, pitta: 1, kapha: 1 }
      },
      {
        id: 'over_8_5',
        label: 'More than 8.5–9 hours with lingering sluggishness',
        detail: 'May indicate heavy Kapha stagnation or metabolic slow-down.',
        scores: { vata: 0, pitta: 0, kapha: 2 }
      }
    ]
  },
  {
    id: 'q_life_skincare_routine',
    sectionId: 'lifestyle',
    category: 'lifestyle_context',
    title: 'Current Daily Skincare Habits & Complexity',
    hint: 'Understanding your existing routine helps tailor realistic next steps.',
    options: [
      {
        id: 'minimal_inconsistent',
        label: 'Minimalist / Inconsistent (Water only or occasional soap)',
        detail: 'Looking for a simple, accessible foundation without overwhelming steps.',
        scores: { vata: 1, pitta: 1, kapha: 1 }
      },
      {
        id: 'gentle_hydrating',
        label: 'Gentle hydration focused (Cleanser, moisturizer, barrier oils)',
        detail: 'Prioritizing nourishment and soothing dry or sensitive skin.',
        scores: { vata: 2, pitta: 0, kapha: 0 }
      },
      {
        id: 'clarifying_active',
        label: 'Clarifying & Targeted (Salicylic acid, sunscreen, exfoliants)',
        detail: 'Actively managing pores, excess shine, or pigmentation.',
        scores: { vata: 0, pitta: 1, kapha: 2 }
      },
      {
        id: 'calming_cooling',
        label: 'Calming & Cooling (Rose water, aloe, minimal harsh acids)',
        detail: 'Targeted towards cooling redness and soothing reactive inflammation.',
        scores: { vata: 0, pitta: 2, kapha: 0 }
      }
    ]
  },
  {
    id: 'q_life_environment',
    sectionId: 'lifestyle',
    category: 'lifestyle_context',
    title: 'Primary Environmental & Daily Exposure',
    hint: 'External climate exerts significant continuous influence on facial skin.',
    options: [
      {
        id: 'dry_ac_office',
        label: 'High indoor air conditioning / central heating & screen time',
        detail: 'Artificial dry airflow strips trans-epidermal moisture rapidly.',
        scores: { vata: 2, pitta: 0, kapha: 0 }
      },
      {
        id: 'sunny_outdoor',
        label: 'Frequent direct sunlight, tropical climate, or intense heat',
        detail: 'Increases photo-damage risk, melanin synthesis, and erythema.',
        scores: { vata: 0, pitta: 2, kapha: 0 }
      },
      {
        id: 'humid_urban',
        label: 'Humid, rainy, or high-pollution urban environment',
        detail: 'Micro-particulates can mix with sebum and lead to congested pores.',
        scores: { vata: 0, pitta: 0, kapha: 2 }
      },
      {
        id: 'temperate_moderate',
        label: 'Temperate climate with balanced indoor/outdoor time',
        detail: 'Low severe environmental stress on the cutaneous lipid mantle.',
        scores: { vata: 1, pitta: 1, kapha: 1 }
      }
    ]
  },
  {
    id: 'q_life_concerns',
    sectionId: 'lifestyle',
    category: 'lifestyle_context',
    title: 'Primary Skincare Priority or Concern',
    hint: 'What specific improvement would you most like to see in your skin?',
    options: [
      {
        id: 'concern_dryness_aging',
        label: 'Dryness, tight flaking, dullness, or fine lines',
        detail: 'Goal: Replenish deep lipid hydration and restore plump radiant bounce.',
        scores: { vata: 2, pitta: 0, kapha: 0 }
      },
      {
        id: 'concern_redness_sensitivity',
        label: 'Redness, burning, rosacea flare-ups, or sun sensitivity',
        detail: 'Goal: Soothe micro-inflammation, cool heat, and reinforce gentle barrier.',
        scores: { vata: 0, pitta: 2, kapha: 0 }
      },
      {
        id: 'concern_oil_acne',
        label: 'Clogged pores, stubborn blackheads, excess oil, or puffiness',
        detail: 'Goal: Clarify texture, regulate sebum balance, and stimulate lymphatic drainage.',
        scores: { vata: 0, pitta: 0, kapha: 2 }
      },
      {
        id: 'concern_maintenance',
        label: 'General preventive wellness, radiance, and holistic glow',
        detail: 'Goal: Maintain balanced equilibrium with harmonious botanical care.',
        scores: { vata: 1, pitta: 1, kapha: 1 }
      }
    ]
  }
];
