import React, { useState, useEffect } from 'react';
import {
  QUESTIONNAIRE_QUESTIONS,
  QUESTIONNAIRE_SECTIONS,
  QUESTIONNAIRE_VERSION
} from '../config/questionnaireConfig';

export default function QuestionnaireStepper({
  initialResponses = {},
  onComplete,
  onSkip,
  onBackToImage
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [responses, setResponses] = useState(initialResponses || {});
  const [validationError, setValidationError] = useState('');

  // Sync when initial responses are provided (e.g., when editing existing responses)
  useEffect(() => {
    if (initialResponses && Object.keys(initialResponses).length > 0) {
      setResponses(initialResponses);
    }
  }, [initialResponses]);

  const currentQ = QUESTIONNAIRE_QUESTIONS[currentIdx];
  const currentSection = QUESTIONNAIRE_SECTIONS.find((s) => s.id === currentQ.sectionId);
  const totalQuestions = QUESTIONNAIRE_QUESTIONS.length;
  const answeredCount = QUESTIONNAIRE_QUESTIONS.filter(q => !!responses[q.id]).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  const handleSelectOption = (optionId) => {
    setResponses((prev) => ({
      ...prev,
      [currentQ.id]: optionId
    }));
    setValidationError('');
  };

  const handleNext = () => {
    if (!responses[currentQ.id]) {
      setValidationError('Please select an option before moving to the next question.');
      return;
    }
    setValidationError('');
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Prevent completion if question jumping left any gap.
      const firstUnanswered = QUESTIONNAIRE_QUESTIONS.findIndex(q => !responses[q.id]);
      if (firstUnanswered >= 0) {
        setCurrentIdx(firstUnanswered);
        setValidationError('Please complete all questions before viewing results.');
        return;
      }
      onComplete(responses);
    }
  };

  const handlePrevious = () => {
    setValidationError('');
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const handleJumpToQuestion = (idx) => {
    // If questions are already answered, allow jumping freely to edit any question
    const allPriorAnswered = QUESTIONNAIRE_QUESTIONS.slice(0, idx).every(q => !!responses[q.id]);
    if (responses[QUESTIONNAIRE_QUESTIONS[idx]?.id] || idx < currentIdx || allPriorAnswered) {
      setValidationError('');
      setCurrentIdx(idx);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* --- HEADER & PROGRESS --- */}
      <div className="bg-white rounded-2xl border border-[#5C7A4E]/20 shadow-sm p-6 sm:p-8 mb-6">

        {/* Section Pill and Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-[#EFF4EB] text-[#5C7A4E]">
              {currentSection?.title}
            </span>
            <p className="text-xs text-gray-500 mt-1">{currentSection?.subtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            {onBackToImage && (
              <button
                type="button"
                onClick={onBackToImage}
                className="text-xs text-gray-500 hover:text-gray-800 underline transition-colors px-2 py-1"
              >
                ← Back to Photo
              </button>
            )}
            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="text-xs text-[#8B6347] hover:text-[#5C7A4E] transition-colors font-medium border border-[#8B6347]/30 hover:border-[#5C7A4E] rounded-lg px-3 py-1"
              >
                Skip to Image-Only
              </button>
            )}
          </div>
        </div>

        {/* Section Navigation Pills */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {QUESTIONNAIRE_SECTIONS.map((sec, secIdx) => {
            const isCurrentSec = sec.id === currentQ.sectionId;
            const secQuestions = QUESTIONNAIRE_QUESTIONS.filter((q) => q.sectionId === sec.id);
            const answeredInSec = secQuestions.filter((q) => responses[q.id]).length;
            const isSecComplete = answeredInSec === secQuestions.length;

            return (
              <div
                key={sec.id}
                className={`p-2.5 rounded-xl border text-center transition-all ${isCurrentSec
                    ? 'border-[#5C7A4E] bg-[#EFF4EB]/60 shadow-xs'
                    : isSecComplete
                      ? 'border-gray-200 bg-gray-50 text-gray-600'
                      : 'border-gray-200/60 bg-white text-gray-400'
                  }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#5C7A4E]">
                  Section {secIdx + 1}
                </div>
                <div className="text-xs font-medium truncate mt-0.5 text-gray-800 hidden sm:block">
                  {sec.id === 'skin' ? 'Skin Traits' : sec.id === 'constitution' ? 'Constitution' : 'Lifestyle'}
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  {answeredInSec}/{secQuestions.length} answered
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="mb-2">
          <div className="flex justify-between items-center text-xs text-gray-500 mb-1.5 font-medium">
            <span>
              Question <strong className="text-gray-900">{currentIdx + 1}</strong> of {totalQuestions}
            </span>
            <span>{answeredCount}/{totalQuestions} answered ({progressPercent}%)</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#5C7A4E] h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* --- QUESTION CARD --- */}
      <div className="bg-white rounded-2xl border border-[#5C7A4E]/20 shadow-sm p-6 sm:p-8">

        <div className="mb-6">
          <div className="text-xs font-semibold text-[#5C7A4E] uppercase tracking-wider mb-1">
            Question {currentIdx + 1}
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900 leading-snug">
            {currentQ.title}
          </h2>
          {currentQ.hint && (
            <p className="text-sm text-gray-600 mt-1.5 italic">
              {currentQ.hint}
            </p>
          )}
        </div>

        {validationError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <span>⚠️</span>
            <span>{validationError}</span>
          </div>
        )}

        {/* Option Cards */}
        <div className="space-y-3 mb-8">
          {currentQ.options.map((opt) => {
            const isSelected = responses[currentQ.id] === opt.id;
            return (
              <label
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                className={`block relative p-4 sm:p-5 rounded-xl border cursor-pointer transition-all ${isSelected
                    ? 'border-[#5C7A4E] bg-[#EFF4EB]/50 shadow-xs ring-1 ring-[#5C7A4E]'
                    : 'border-gray-200 hover:border-[#5C7A4E]/50 hover:bg-gray-50/60 bg-white'
                  }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="pt-0.5">
                    <input
                      type="radio"
                      name={`question-${currentQ.id}`}
                      checked={isSelected}
                      onChange={() => handleSelectOption(opt.id)}
                      className="h-4 w-4 text-[#5C7A4E] focus:ring-[#5C7A4E] border-gray-300 accent-[#5C7A4E]"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm sm:text-base font-semibold text-gray-900">
                      {opt.label}
                    </div>
                    {opt.detail && (
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                        {opt.detail}
                      </p>
                    )}
                  </div>
                </div>
              </label>
            );
          })}
        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentIdx === 0}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${currentIdx === 0
                ? 'text-gray-300 cursor-not-allowed border border-gray-200'
                : 'text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
          >
            ← Previous
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="px-7 py-2.5 rounded-xl text-sm font-medium text-white bg-[#5C7A4E] hover:bg-[#8BAD7A] shadow-sm transition-all transform hover:-translate-y-0.5"
          >
            {currentIdx === totalQuestions - 1 ? 'Complete & View Results →' : 'Next Question →'}
          </button>
        </div>

      </div>

      {/* Mini Question Pagination Dots */}
      <div className="flex flex-wrap justify-center gap-1.5 mt-6">
        {QUESTIONNAIRE_QUESTIONS.map((q, idx) => {
          const isAnswered = !!responses[q.id];
          const isCurrent = idx === currentIdx;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => handleJumpToQuestion(idx)}
              title={`Question ${idx + 1}: ${q.title}`}
              className={`h-2.5 w-2.5 rounded-full transition-all ${isCurrent
                  ? 'w-6 bg-[#5C7A4E]'
                  : isAnswered
                    ? 'bg-[#8BAD7A]'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
            />
          );
        })}
      </div>

    </div>
  );
}
