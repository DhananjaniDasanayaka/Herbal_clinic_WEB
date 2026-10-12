/**
 * Comparative Assessment Engine
 * 
 * Compares Image AI (MobileNetV2) and Questionnaire Assessment.
 * 
 * Scientific Rigor & Ethics:
 * - Never silently override one result with another.
 * - Do NOT generate an unsupported combined "fused" confidence percentage.
 * - MobileNetV2 classifies visual photographic patterns and does NOT biophysically
 *   measure skin hydration, barrier lipids, or inflammatory markers.
 * - Model confidence represents uncalibrated neural network softmax output,
 *   not a validated clinical probability.
 * - Never labels incomplete or inconclusive results as disagreements.
 * - Keeps both assessments independently visible.
 */

export function compareAssessments(imageResult, questionnaireResult) {
  if (!imageResult || !imageResult.dosha) {
    return {
      status: 'uncompared',
      title: 'Assessment Incomplete',
      badgeColor: 'gray',
      summary: 'Image prediction is missing.',
      detailedExplanation: 'Please complete the facial image assessment first.',
      uncertaintyNotes: 'Incomplete data.',
      recommendationContext: 'General'
    };
  }

  const imgDosha = imageResult.dosha; // 'Vata' | 'Pitta' | 'Kapha' | 'Balanced'
  const imgConf = Number(imageResult.confidence || 0);
  const qOutcome = questionnaireResult?.outcome || 'Incomplete';
  const qOutcomeType = questionnaireResult?.outcomeType || 'incomplete';
  const qPercentages = questionnaireResult?.percentages || { vata: 0, pitta: 0, kapha: 0 };
  const isComplete = Boolean(questionnaireResult?.isComplete);

  const baselineUncertainty = 'MobileNetV2 classifies visual photographic patterns from training dataset associations and does not biophysically measure skin hydration, epidermal barrier lipids, or metabolic markers. Model confidence reflects neural network softmax output, not a clinically calibrated probability of correctness.';

  // Case 1: Questionnaire was skipped or incomplete -> 'uncompared' (NEVER a disagreement!)
  if (!isComplete || qOutcomeType === 'incomplete') {
    return {
      status: 'uncompared',
      title: 'Single-Modal (Image Only)',
      badgeColor: 'amber',
      summary: `Image analysis classified your photograph as ${imgDosha} (${imgConf}% confidence). The questionnaire was skipped or partially answered.`,
      detailedExplanation: 'A holistic comparison requires both facial photography analysis and self-reported wellness indicators. Complete the questionnaire anytime to unlock dual-track comparative insights.',
      uncertaintyNotes: baselineUncertainty,
      recommendationContext: imgDosha
    };
  }

  // Case 2: Inconclusive or mixed questionnaire -> 'comparative' (NEVER a disagreement!)
  if (qOutcomeType === 'inconclusive' || qOutcomeType === 'mixed') {
    return {
      status: 'comparative',
      title: 'Inconclusive Questionnaire Profile',
      badgeColor: 'blue',
      summary: `The image model classified ${imgDosha} (${imgConf}% confidence), while self-reported wellness answers show an inconclusive or varied pattern.`,
      detailedExplanation: 'This pattern reflects diverse responses across lifestyle and physical indicators rather than a confirmed contradiction with the image classification.',
      uncertaintyNotes: baselineUncertainty,
      recommendationContext: imgDosha
    };
  }

  // Case 3: Image is 'Balanced'
  if (imgDosha.toLowerCase() === 'balanced') {
    if (qOutcomeType === 'tridoshic') {
      return {
        status: 'comparative',
        title: 'Dual-Modal Balance (Independent Modalities)',
        badgeColor: 'emerald',
        summary: `The vision model classified your photo as Balanced, while your self-reported questionnaire indicates Tridoshic constitutional distribution.`,
        detailedExplanation: `These outcomes evaluate two distinct dimensions: the image model classified facial photographic patterns as Balanced (${imgConf}% confidence), and your self-reported questionnaire reflects an even distribution across all three constitutional doshas. They measure separate modalities and are not synonymous.`,
        uncertaintyNotes: baselineUncertainty,
        recommendationContext: 'Balanced'
      };
    } else {
      return {
        status: 'comparative',
        title: 'Complementary Perspectives',
        badgeColor: 'blue',
        summary: `Visual image classification indicated Balanced (${imgConf}%), while your self-reported questionnaire indicates a ${qOutcome} tendency.`,
        detailedExplanation: `The vision model classified photographic facial features into the Balanced category. Concurrently, your self-reported questionnaire reflects systemic and metabolic preferences associated with ${qOutcome}. Both perspectives are displayed independently.`,
        uncertaintyNotes: baselineUncertainty,
        recommendationContext: qOutcome.split('-')[0] || imgDosha
      };
    }
  }

  // Case 4: Exact dominant match (e.g. Pitta & Pitta)
  if (qOutcome.toLowerCase() === imgDosha.toLowerCase()) {
    return {
      status: 'agreed',
      title: 'High Concordance (Agreed)',
      badgeColor: 'emerald',
      summary: `Both methods point toward ${imgDosha} characteristics.`,
      detailedExplanation: `The computer vision model classified photographic features as ${imgDosha} (${imgConf}% confidence), and your self-reported indicators similarly established ${imgDosha} as dominant (${qPercentages[imgDosha.toLowerCase()]}% indicator share).`,
      uncertaintyNotes: baselineUncertainty,
      recommendationContext: imgDosha
    };
  }

  // Case 5: Dual-dosha questionnaire outcome containing the image dosha
  if (qOutcome.toLowerCase().includes(imgDosha.toLowerCase())) {
    return {
      status: 'partial',
      title: 'Partial Concordance',
      badgeColor: 'teal',
      summary: `Image analysis classified ${imgDosha} (${imgConf}%), aligning with the ${imgDosha} component of your dual-doshic (${qOutcome}) profile.`,
      detailedExplanation: `Your photographic scan was classified as ${imgDosha} by the MobileNetV2 model. The questionnaire indicated that in addition to ${imgDosha} traits, you also exhibit notable constitutional characteristics of the secondary dosha.`,
      uncertaintyNotes: baselineUncertainty,
      recommendationContext: imgDosha
    };
  }

  // Case 6: Questionnaire is Tridoshic while Image detected a specific Dosha
  if (qOutcomeType === 'tridoshic') {
    return {
      status: 'comparative',
      title: 'Topical Classification vs. Constitutional Balance',
      badgeColor: 'indigo',
      summary: `The camera model classified ${imgDosha} (${imgConf}%), while your self-reported questionnaire is evenly balanced across all doshas.`,
      detailedExplanation: `Your holistic habits and traits reflect a Tridoshic equilibrium, while the camera model categorized current facial appearance into ${imgDosha}. In photographic analysis, temporary surface appearance can differ from systemic lifestyle balance.`,
      uncertaintyNotes: baselineUncertainty,
      recommendationContext: imgDosha
    };
  }

  // Case 7: Direct Disagreement / Divergence
  return {
    status: 'disagreed',
    title: 'Divergent Assessment',
    badgeColor: 'amber',
    summary: `Visual analysis indicated ${imgDosha} (${imgConf}%), whereas your questionnaire indicated ${qOutcome}.`,
    detailedExplanation: `The computer vision model categorized photographic visual features as ${imgDosha}. In contrast, your self-reported questionnaire answers reflect constitutional and lifestyle patterns aligning with ${qOutcome}. Photographic appearance under ambient lighting can differ from systemic constitutional habits. Neither method overrides the other.`,
    uncertaintyNotes: baselineUncertainty,
    recommendationContext: `${imgDosha} & ${qOutcome}`
  };
}
