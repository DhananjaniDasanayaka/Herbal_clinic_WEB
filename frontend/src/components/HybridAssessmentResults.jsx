import React, { useState } from 'react';
import MeditationPlayer from './MeditationPlayer';
import SkincareChecklist from './SkincareChecklist';

export default function HybridAssessmentResults({
  imageResult,
  imagePreviewUrl,
  questionnaireResult,
  comparisonResult,
  recommendations,
  onRetakeQuestionnaire,
  onRetakeImage,
  onRestartAll,
  onSaveToDatabase,
  saveStatus // 'idle' | 'saving' | 'saved' | 'error'
}) {
  const [activeTab, setActiveTab] = useState('ayurvedic'); // 'ayurvedic' | 'evidence' | 'lifestyle'
  const [showMethodology, setShowMethodology] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  const imgDosha = imageResult?.dosha || 'Unknown';
  const imgConf = Number(imageResult?.confidence || 0);
  const qOutcome = questionnaireResult?.outcome || 'Incomplete';
  const qScores = questionnaireResult?.percentages || { vata: 0, pitta: 0, kapha: 0 };
  const rawScores = questionnaireResult?.rawScores || { vata: 0, pitta: 0, kapha: 0 };

  const getDoshaAudio = (dosha) => {
    switch (dosha?.toLowerCase()) {
      case 'vata': return '/audio/vata-audio.mp3';
      case 'pitta': return '/audio/pitta-audio.mp3';
      case 'kapha': return '/audio/kapha-audio.mp3';
      case 'balanced':
      default: return '/audio/balanced-audio.mp3';
    }
  };

  const getDoshaTasks = (dosha) => {
    switch (dosha?.toLowerCase()) {
      case 'vata':
        return [
          "Apply warm sesame or almond oil (Abhyanga)",
          "Use a gentle, hydrating aloe vera cleanser",
          "Drink warm water with a pinch of ginger",
          "Avoid harsh, drying foaming soaps"
        ];
      case 'pitta':
        return [
          "Apply cooling sandalwood or aloe vera gel",
          "Spritz face with pure rose water toner",
          "Avoid direct sun exposure during peak hours",
          "Drink cooling coconut water"
        ];
      case 'kapha':
        return [
          "Wash face with warm water to open pores",
          "Exfoliate with a gentle chickpea flour (besan) scrub",
          "Apply a purifying neem-based face mask",
          "Avoid heavy, greasy night creams"
        ];
      default:
        return [
          "Drink plenty of water",
          "Cleanse face gently twice a day",
          "Apply a light herbal moisturizer",
          "Get at least 8 hours of restful sleep"
        ];
    }
  };

  // Color badges based on comparison status
  const getStatusBadge = () => {
    const status = comparisonResult?.status;
    switch (status) {
      case 'agreed':
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-800',
          pill: 'bg-emerald-600 text-white',
          icon: '✅'
        };
      case 'partial':
        return {
          bg: 'bg-teal-50',
          border: 'border-teal-200',
          text: 'text-teal-800',
          pill: 'bg-teal-600 text-white',
          icon: '🤝'
        };
      case 'comparative':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          pill: 'bg-blue-600 text-white',
          icon: '⚖️'
        };
      case 'uncompared':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-900',
          pill: 'bg-amber-600 text-white',
          icon: '📋'
        };
      case 'disagreed':
      default:
        return {
          bg: 'bg-stone-50',
          border: 'border-stone-300',
          text: 'text-stone-900',
          pill: 'bg-stone-700 text-white',
          icon: '🔍'
        };
    }
  };

  const statusStyle = getStatusBadge();

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in-up">

      {/* --- COMPARATIVE BANNER --- */}
      <div className={`p-6 sm:p-8 rounded-2xl border ${statusStyle.border} ${statusStyle.bg} shadow-xs`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{statusStyle.icon}</span>
            <div>
              <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusStyle.pill} uppercase tracking-wider mb-1`}>
                {comparisonResult?.title || 'Comparative Assessment'}
              </span>
              <h2 className={`text-xl sm:text-2xl font-bold ${statusStyle.text}`}>
                Hybrid AI + Questionnaire Synthesis
              </h2>
            </div>
          </div>
        </div>

        <p className="text-sm sm:text-base text-gray-700 leading-relaxed mt-2">
          {comparisonResult?.summary}
        </p>

        {comparisonResult?.detailedExplanation && (
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-3 pt-3 border-t border-black/5">
            <strong>Comparative Analysis:</strong> {comparisonResult.detailedExplanation}
          </p>
        )}
      </div>

      {/* --- INFORMED CONSENT & SAVE SECTION --- */}
      <div className="bg-white rounded-2xl border border-[#5C7A4E]/20 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Save Wellness Assessment
            </h4>
            <label className="flex items-start gap-3 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={consentGiven || saveStatus === 'saved'}
                disabled={saveStatus === 'saved'}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-1 h-4 w-4 text-[#5C7A4E] focus:ring-[#5C7A4E] border-gray-300 rounded accent-[#5C7A4E]"
              />
              <span className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                I consent to saving my questionnaire answers, image-prediction result, and wellness suggestions to my account history. <strong>My photo is sent to the Flask AI service for processing, but is not included in MongoDB assessment history.</strong>
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end">
            {saveStatus === 'saved' ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100 px-4 py-2 rounded-xl">
                <span>✓</span> Saved to Profile History
              </span>
            ) : saveStatus === 'saving' ? (
              <button
                type="button"
                disabled
                className="text-xs sm:text-sm font-medium px-5 py-2.5 rounded-xl text-gray-500 bg-gray-100 cursor-wait animate-pulse"
              >
                Saving to Database...
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSaveToDatabase(consentGiven)}
                disabled={!consentGiven}
                className={`text-xs sm:text-sm font-medium px-5 py-2.5 rounded-xl text-white transition-all shadow-xs ${consentGiven
                    ? 'bg-[#5C7A4E] hover:bg-[#8BAD7A] cursor-pointer'
                    : 'bg-gray-300 cursor-not-allowed text-gray-500'
                  }`}
              >
                💾 Save Assessment to History
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- SIDE-BY-SIDE ASSESSMENT RESULTS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 1. FACIAL IMAGE AI CARD */}
        <div className="bg-white rounded-2xl border border-[#5C7A4E]/20 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5C7A4E]">
                Method 1: Computer Vision
              </span>
              <span className="text-[11px] font-mono text-gray-400">MobileNetV2</span>
            </div>

            <div className="flex items-center gap-4 mb-5">
              {imagePreviewUrl ? (
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0 shadow-xs">
                  <img src={imagePreviewUrl} alt="Facial scan preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-2xl flex-shrink-0">
                  📸
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Image Classified Dosha</p>
                <h3 className="text-3xl font-extrabold text-[#1E1E1A] mt-0.5 font-serif">
                  {imgDosha}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Model Confidence: <strong className="text-gray-900">{imgConf}%</strong>
                </p>
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="mb-4">
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#5C7A4E] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${imgConf}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Classified photographic visual patterns based on dataset image features. <em>(Does not measure epidermal hydration, lipids, or medical status).</em>
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">Client-reported inference</span>
            <button
              type="button"
              onClick={onRetakeImage}
              className="text-xs text-[#5C7A4E] font-medium hover:underline"
            >
              🔄 Change Photo
            </button>
          </div>
        </div>

        {/* 2. QUESTIONNAIRE WELLNESS PROFILE CARD */}
        <div className="bg-white rounded-2xl border border-[#5C7A4E]/20 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8B6347]">
                Method 2: Multi-Step Questionnaire
              </span>
              <span className="text-[11px] font-mono text-gray-400">15 Questions</span>
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Constitutional Profile</p>
              <h3 className="text-3xl font-extrabold text-[#1E1E1A] mt-0.5 font-serif">
                {qOutcome}
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                {questionnaireResult?.explanation}
              </p>
            </div>

            {/* 3-Dosha Score Breakdown (Exact 100% Normalized) */}
            <div className="space-y-2 mb-4 bg-gray-50/70 p-3.5 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-2">
                <span>Normalized Indicator Share</span>
                <span className="text-gray-400 font-normal">Exact 100% Sum</span>
              </div>

              {/* Vata Bar */}
              <div>
                <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
                  <span>Vata (Air & Space)</span>
                  <span>{qScores.vata}% ({rawScores.vata} pts)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-sky-600 h-1.5 rounded-full" style={{ width: `${qScores.vata}%` }} />
                </div>
              </div>

              {/* Pitta Bar */}
              <div>
                <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
                  <span>Pitta (Fire & Water)</span>
                  <span>{qScores.pitta}% ({rawScores.pitta} pts)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `${qScores.pitta}%` }} />
                </div>
              </div>

              {/* Kapha Bar */}
              <div>
                <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
                  <span>Kapha (Earth & Water)</span>
                  <span>{qScores.kapha}% ({rawScores.kapha} pts)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${qScores.kapha}%` }} />
                </div>
              </div>
            </div>

            {/* Section Dominance Preview */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600">
              <div className="p-2 rounded-lg bg-white border border-gray-200/60">
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">Constitution (Prakriti):</span>
                <span className="font-medium text-gray-800">{questionnaireResult?.constitutionPrakritiDominance || 'Pending'}</span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-gray-200/60">
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">Skin Tendency (Vikriti):</span>
                <span className="font-medium text-gray-800">{questionnaireResult?.skinVikritiTendency || 'Pending'}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">Unvalidated research prototype</span>
            <button
              type="button"
              onClick={onRetakeQuestionnaire}
              className="text-xs text-[#8B6347] font-medium hover:underline"
            >
              ✏️ Edit Questionnaire
            </button>
          </div>
        </div>

      </div>

      {/* --- UNCERTAINTY & LIMITATION NOTICES --- */}
      <div className="bg-[#FAF7F2] rounded-2xl border border-[#5C7A4E]/20 p-6 text-gray-700 shadow-xs">
        <div className="flex items-start gap-3">
          <span className="text-xl">ℹ️</span>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 text-sm mb-1 uppercase tracking-wide">
              Scientific Transparency & Uncertainty Disclosure
            </h4>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3">
              {comparisonResult?.uncertaintyNotes}
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>• <strong>Non-Diagnostic:</strong> This assessment is exploratory and educational; it is not a clinical medical diagnosis or pulse evaluation (Nadi Pariksha).</p>
              <p>• <strong>Uncalibrated Confidence:</strong> Deep neural network confidence represents softmax layer activation and may not correspond to calibrated real-world probabilities.</p>
              <p>• <strong>Independent Visibility:</strong> Both computer vision and self-reported methods are displayed side-by-side without synthetic or unsupported fusion.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowMethodology(!showMethodology)}
              className="text-xs text-[#5C7A4E] font-semibold underline mt-3 inline-block"
            >
              {showMethodology ? 'Hide Algorithm Methodology' : 'View Scoring Methodology & Decision Rules'}
            </button>
          </div>
        </div>

        {showMethodology && (
          <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-600 space-y-2">
            <p><strong>Prototype Weights:</strong> Section B constitution markers carry 3 pts; Section A skin markers carry 2–3 pts; Section C lifestyle context carries 1–2 pts.</p>
            <p><strong>Decision Rules:</strong> Dominant single dosha requires ≥42% indicator share with ≥12% margin over the second dosha. Margins &lt;12% produce a dual-dosha classification. All three doshas within an 11% variance span produce a Tridoshic outcome.</p>
            <p><strong>Distinction from ML 'Balanced':</strong> The camera detects photographic patterns. Questionnaire outcomes reflect constitutional indicators and are never falsely equated with camera predictions.</p>
          </div>
        )}
      </div>

      {/* --- PERSONALIZED RECOMMENDATIONS (DUAL-TRACK) --- */}
      <div className="bg-white rounded-2xl border border-[#5C7A4E]/20 p-6 sm:p-8 shadow-sm">
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5C7A4E]">
            Holistic Skincare Strategy
          </span>
          <h3 className="text-2xl font-bold font-serif text-gray-900 mt-1">
            Personalized Skincare & Wellness Guidance
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Carefully separated between traditional Ayurvedic wisdom and modern evidence-based dermatological practices.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('ayurvedic')}
            className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'ayurvedic'
                ? 'border-[#5C7A4E] text-[#5C7A4E]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
          >
            🌿 Traditional Ayurvedic Care
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('evidence')}
            className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'evidence'
                ? 'border-[#5C7A4E] text-[#5C7A4E]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
          >
            🔬 Evidence-Based Skincare
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('lifestyle')}
            className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'lifestyle'
                ? 'border-[#5C7A4E] text-[#5C7A4E]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
          >
            ☀️ Daily Rhythms & Lifestyle
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[160px]">
          {activeTab === 'ayurvedic' && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Classical Botanical Routines (Prakriti Harmonization)
              </p>
              {recommendations?.ayurvedic?.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-[#EFF4EB]/40 border border-[#5C7A4E]/10">
                  <span className="text-[#5C7A4E] font-bold text-sm mt-0.5">•</span>
                  <p className="text-sm text-gray-800 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'evidence' && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Dermatological & Barrier Protection Science
              </p>
              {recommendations?.evidenceBased?.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50/50 border border-blue-100">
                  <span className="text-blue-700 font-bold text-sm mt-0.5">•</span>
                  <p className="text-sm text-gray-800 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'lifestyle' && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Circadian Rhythm, Sleep & Stress Optimization
              </p>
              {recommendations?.lifestyle?.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50/50 border border-amber-100">
                  <span className="text-amber-700 font-bold text-sm mt-0.5">•</span>
                  <p className="text-sm text-gray-800 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-[11px] text-gray-400 mt-6 pt-4 border-t border-gray-100 italic">
          {recommendations?.disclaimer}
        </p>
      </div>

      {/* --- PRESERVED INTEGRATED AUDIO PLAYER & CHECKLIST --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <MeditationPlayer
            title={`${imgDosha} Balancing Meditation`}
            audioSrc={getDoshaAudio(imgDosha)}
          />
        </div>
        <div className="bg-white rounded-2xl border border-[#5C7A4E]/20 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 border-b border-gray-100 pb-2 mb-3">
            Daily {imgDosha} Skincare Checklist
          </h3>
          <SkincareChecklist tasks={getDoshaTasks(imgDosha)} />
        </div>
      </div>

      {/* --- FOOTER ACTION BUTTONS --- */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onRestartAll}
          className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 hover:bg-gray-50 px-5 py-2.5 rounded-xl transition-colors"
        >
          🔄 Start Brand New Assessment
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onRetakeQuestionnaire}
            className="text-sm text-[#8B6347] border border-[#8B6347]/30 hover:border-[#8B6347] px-4 py-2.5 rounded-xl transition-colors"
          >
            ✏️ Edit Questionnaire
          </button>
          <button
            type="button"
            onClick={onRetakeImage}
            className="text-sm text-[#5C7A4E] border border-[#5C7A4E]/30 hover:border-[#5C7A4E] px-4 py-2.5 rounded-xl transition-colors"
          >
            📸 Change Photo
          </button>
        </div>
      </div>

    </div>
  );
}
