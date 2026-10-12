/**
 * Dual-Track Recommendation Engine
 * 
 * Provides personalized non-diagnostic wellness and skincare advice based primarily
 * on self-reported concerns and preferences.
 * 
 * Strictly distinguishes:
 *  - Traditional Ayurvedic Recommendations (herbal practices, Dinacharya, thermal balancing)
 *  - Evidence-Based Skincare Advice (barrier lipids, UV photoprotection, gentle pH, dermatology science)
 * 
 * Accurately handles skipped questionnaires without fabricating a "Balanced" questionnaire result.
 */

export function generatePersonalizedRecommendations({
  imageDosha = 'Balanced',
  questionnaireOutcome = 'Skipped (Incomplete)',
  responses = {},
  questionnaireScores = {}
}) {
  const primaryConcern = responses['q_life_concerns'] || 'concern_maintenance';
  const environment = responses['q_life_environment'] || 'temperate_moderate';
  const irritationType = responses['q_skin_irritation_type'] || 'rare_breakouts';
  const sleepHours = responses['q_life_sleep_hours'] || '7_to_8';

  const ayurvedic = [];
  const evidenceBased = [];
  const lifestyle = [];

  const isSkipped = !questionnaireOutcome || questionnaireOutcome.includes('Skipped') || questionnaireOutcome.includes('Incomplete');

  // Determine dosha traits
  const isVata = (!isSkipped && questionnaireOutcome.includes('Vata')) || imageDosha === 'Vata';
  const isPitta = (!isSkipped && questionnaireOutcome.includes('Pitta')) || imageDosha === 'Pitta';
  const isKapha = (!isSkipped && questionnaireOutcome.includes('Kapha')) || imageDosha === 'Kapha';

  // --- 1. TRADITIONAL AYURVEDIC RECOMMENDATIONS ---
  if (isVata) {
    ayurvedic.push('Mukha Abhyanga: Perform a gentle 3-minute evening facial massage using warm, cold-pressed sesame or almond oil to nourish dry tissue (Vata pacification).');
    ayurvedic.push('Warm Botanical Cleanse: Wash with gentle herbal powders like licorice root (Yashtimadhu) or hydrating oat infusions instead of astringent foaming soaps.');
    ayurvedic.push('Internal Agni Warming: Sip warm water infused with fresh ginger slices and fennel seeds throughout the day to support circulation and counter dryness.');
  }

  if (isPitta) {
    ayurvedic.push('Sheetali Cooling Mist: Spritz skin twice daily with pure steam-distilled rose water (Gulab Jal) or pure aloe vera juice to soothe heat and redness.');
    ayurvedic.push('Pitta-Pacifying Mask: Apply a cooling weekly paste of pure sandalwood (Chandan) and vetiver (Khus) to balance reactive skin.');
    ayurvedic.push('Cooling Hydration: Drink coconut water or water infused with crushed coriander and cardamom seeds to pacify internal Pitta heat.');
  }

  if (isKapha) {
    ayurvedic.push('Ubtan Gentle Exfoliation: Use a mild paste of chickpea flour (Besan), a pinch of turmeric (Haridra), and warm water 2–3 times a week to remove sluggish sebum.');
    ayurvedic.push('Herbal Steam & Toning: Inhale warm herbal steam with a pinch of tulsi or mint to open congested facial micro-channels (Srotas).');
    ayurvedic.push('Stimulating Teas: Enjoy warming CCF tea (cumin, coriander, fennel) with a touch of black pepper to stimulate sluggish metabolism.');
  }

  if (!isVata && !isPitta && !isKapha) {
    ayurvedic.push('Tridoshic Harmony: Cleanse with mild rose and aloe formulations, maintaining natural physiological equilibrium.');
    ayurvedic.push('Balanced Seasonal Care: Shift oils with the seasons (lighter jojoba in warm months, nourishing sesame in winter).');
  }

  // --- 2. EVIDENCE-BASED SKINCARE ADVICE ---
  evidenceBased.push('Broad-Spectrum UV Photoprotection: Apply a daily broad-spectrum SPF 30–50 mineral or chemical sunscreen every morning, reapplying before outdoor exposure.');

  if (primaryConcern === 'concern_dryness_aging' || irritationType === 'flaking_roughness') {
    evidenceBased.push('Physiological Lipid Barrier Repair: Look for moisturizers containing a physiological ratio of ceramides, cholesterol, and free fatty acids to seal trans-epidermal water loss (TEWL).');
    evidenceBased.push('Humectant Layering: Apply multi-molecular hyaluronic acid or 5% glycerin to damp skin immediately prior to an occlusive barrier cream.');
  } else if (primaryConcern === 'concern_redness_sensitivity' || irritationType === 'red_inflammation') {
    evidenceBased.push('Vascular Soothing Actives: Incorporate evidence-backed anti-inflammatory ingredients such as 2–5% Niacinamide, Madecassoside (Centella Asiatica), or Azelaic Acid to reduce erythema.');
    evidenceBased.push('Hypoallergenic Protocol: Eliminate synthetic fragrances and drying denatured alcohol; always patch-test new products behind the ear for 48 hours.');
  } else if (primaryConcern === 'concern_oil_acne' || irritationType === 'cystic_congestion') {
    evidenceBased.push('Lipophilic Salicylic Acid (BHA): Use a gentle 0.5%–1.5% BHA exfoliant 2 evenings per week to dissolve trapped sebum inside pores without mechanical friction.');
    evidenceBased.push('Non-Comedogenic Hydration: Use an oil-free, gel-based moisturizer with dimethicone or squalane; avoid heavy comedogenic oils on acne-prone facial zones.');
  } else {
    evidenceBased.push('Barrier Maintenance: Use a mild, non-stripping cleanser with a skin-neutral pH (5.0–5.5) to preserve the acid mantle and cutaneous microbiome.');
    evidenceBased.push('Antioxidant Defense: Apply a stable 10% Vitamin C serum in the morning under sunscreen to defend against oxidative environmental stress.');
  }

  if (environment === 'dry_ac_office') {
    evidenceBased.push('Indoor Humidity Management: Consider an office or bedside cool-mist humidifier (aiming for 45–55% ambient humidity) to counter parching air conditioning and heating.');
  } else if (environment === 'sunny_outdoor') {
    evidenceBased.push('Photoaging Defense: Complement sunscreen with UV-protective hats and sunglasses to protect delicate periorbital tissue.');
  }

  // --- 3. LIFESTYLE & SLEEP GUIDANCE ---
  if (sleepHours === 'under_6') {
    lifestyle.push('Sleep Recovery Target: Aim to extend sleep window by 30–45 minutes to support nocturnal growth hormone secretion for dermal cellular turnover.');
  }
  lifestyle.push('Circadian Meal Cadence: Consistent meal timings stabilize digestive blood glucose curves, which directly modulates facial sebum production.');
  lifestyle.push('Mindful De-escalation: Practice 5–10 minutes of slow diaphragmatic breathing before bed to lower systemic cortisol.');

  return {
    ayurvedic,
    evidenceBased,
    lifestyle,
    disclaimer: 'These suggestions are non-diagnostic, educational, and wellness-oriented. For persistent dermatological conditions, severe acne, or medical questions, consult a board-certified dermatologist or healthcare provider.'
  };
}
