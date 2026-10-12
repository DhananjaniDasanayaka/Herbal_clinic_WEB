import { useState, useEffect, useRef } from 'react';
import QuestionnaireStepper from '../components/QuestionnaireStepper';
import HybridAssessmentResults from '../components/HybridAssessmentResults';
import { calculateQuestionnaireScores } from '../utils/questionnaireScoring';
import { compareAssessments } from '../utils/assessmentComparison';
import { generatePersonalizedRecommendations } from '../utils/recommendations';

export default function SkinTypeAssessment() {
  const [userName, setUserName] = useState('Guest');
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Workflow steps: 'capture' | 'image_ready' | 'questionnaire' | 'results'
  const [workflowStep, setWorkflowStep] = useState('capture');

  // Questionnaire responses and results
  const [questionnaireResponses, setQuestionnaireResponses] = useState({});
  const [isSkippedQuestionnaire, setIsSkippedQuestionnaire] = useState(false);
  const [questionnaireResult, setQuestionnaireResult] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [recommendations, setRecommendations] = useState(null);

  // Backend persistence state
  const [savedAssessmentId, setSavedAssessmentId] = useState(null);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [saveErrorMessage, setSaveErrorMessage] = useState('');

  // --- CAMERA STATE/REFS & OBJECT URL CLEANUP ---
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const previewUrlRef = useRef(null);
  const saveInFlightRef = useRef(false);
  const submissionKeyRef = useRef(createSubmissionKey());

  // Keeps network retries idempotent without confusing independent assessments.
  function createSubmissionKey() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `assessment-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  const clearPreviousResults = () => {
    setQuestionnaireResponses({});
    setIsSkippedQuestionnaire(false);
    setQuestionnaireResult(null);
    setComparisonResult(null);
    setRecommendations(null);
    setSavedAssessmentId(null);
    setSaveStatus('idle');
    setSaveErrorMessage('');
    submissionKeyRef.current = createSubmissionKey();
  };

  // Helper to safely set and clean up object URLs
  const updatePreviewUrl = (newUrl) => {
    if (previewUrlRef.current && previewUrlRef.current.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    previewUrlRef.current = newUrl;
    setPreviewUrl(newUrl);
  };

  // Cleanup object URLs and camera stream on unmount
  useEffect(() => {
    return () => {
      if (previewUrlRef.current && previewUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // --- FETCH USER NAME FROM DB ON LOAD ---
  useEffect(() => {
    const fetchUserFromDB = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          const localUser = JSON.parse(localStorage.getItem('herbalUser'));
          if (localUser?.name) setUserName(localUser.name.split(' ')[0]);
          return;
        }

        const response = await fetch('http://localhost:5000/api/auth/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUserName(userData.name ? userData.name.split(' ')[0] : 'Guest');
        }
      } catch (error) {
        console.error('Failed to connect to backend user endpoint:', error);
      }
    };

    fetchUserFromDB();
  }, []);

  // Image predictions are displayed locally; profile synchronization happens only
  // after the user explicitly consents to saving the full assessment.

  // --- PERSIST HYBRID ASSESSMENT TO MONGODB (EXPLICIT USER CHOICE ONLY) ---
  const handleSaveToBackend = async (consentGiven) => {
    if (!consentGiven) {
      setSaveStatus('error');
      setSaveErrorMessage('Informed consent is required to save your assessment to your profile.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setSaveStatus('error');
      setSaveErrorMessage('You must be logged in to save your assessment history.');
      return;
    }

    if (saveInFlightRef.current || saveStatus === 'saved') return;
    saveInFlightRef.current = true;
    setSaveStatus('saving');
    setSaveErrorMessage('');

    try {
      const payload = {
        imagePrediction: aiResult.dosha,
        imageConfidence: aiResult.confidence,
        modelVersion: 'MobileNetV2-dosha-v1',
        submissionKey: submissionKeyRef.current,
        questionnaireResponses: questionnaireResponses || {},
        isSkippedQuestionnaire: Boolean(isSkippedQuestionnaire),
        userConsentGiven: true,
        existingAssessmentId: savedAssessmentId || undefined,
        updateUserProfileSkinType: true
      };

      const response = await fetch('http://localhost:5000/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();

      if (response.ok) {
        if (responseData.assessment?._id) {
          setSavedAssessmentId(responseData.assessment._id);
        }
        // The backend is authoritative for stored scores and comparison status.
        const saved = responseData.assessment;
        if (saved) {
          if (saved.questionnaireScores) {
            setQuestionnaireResult(prev => ({
              ...prev,
              outcome: saved.questionnaireOutcome,
              rawScores: {
                vata: saved.questionnaireScores.vata,
                pitta: saved.questionnaireScores.pitta,
                kapha: saved.questionnaireScores.kapha
              },
              percentages: saved.questionnaireScores.percentages
            }));
          }
          setComparisonResult(prev => ({
            ...prev,
            status: saved.agreementStatus,
            summary: saved.agreementSummary,
            uncertaintyNotes: saved.uncertaintyNotes
          }));
          if (saved.recommendations) setRecommendations(saved.recommendations);
        }
        setSaveStatus('saved');
        console.log('✅ Hybrid assessment recorded in database with server recalculation.');
      } else {
        setSaveStatus('error');
        setSaveErrorMessage(responseData.message || 'Failed to save to database.');
      }
    } catch (error) {
      console.error('Network error during assessment persistence:', error);
      setSaveStatus('error');
      setSaveErrorMessage('Cannot reach server to save assessment. Your results are still available below.');
    } finally {
      saveInFlightRef.current = false;
    }
  };

  // --- AI IMAGE FUNCTIONS ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      updatePreviewUrl(URL.createObjectURL(file));
      setAiResult(null);
      clearPreviousResults();
      setWorkflowStep('capture');
    }
  };

  // --- CAMERA FUNCTIONS ---
  const openCamera = async () => {
    setCameraError(null);
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setCameraError('Could not access camera. Please check permissions and try again.');
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
    setCameraError(null);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `dosha-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setSelectedImage(file);
        updatePreviewUrl(URL.createObjectURL(blob));
        setAiResult(null);
        clearPreviousResults();
        setWorkflowStep('capture');
      }
      closeCamera();
    }, 'image/jpeg', 0.92);
  };

  // --- STEP 3: ANALYZE IMAGE WITH FLASK AI ---
  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('file', selectedImage);

    try {
      const response = await fetch('http://127.0.0.1:5001/predict', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        setAiResult(data);
        clearPreviousResults();
        setWorkflowStep('image_ready');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Connection error:', error);
      alert('Could not connect to the AI server. Is Python running on port 5001?');
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 4: TRANSITION TO QUESTIONNAIRE ---
  const handleContinueToQuestionnaire = () => {
    setWorkflowStep('questionnaire');
  };

  // --- STEP 5 -> 6, 7, 8, 9: COMPLETE QUESTIONNAIRE (NO AUTO-SAVE) ---
  const handleCompleteQuestionnaire = (completedResponses) => {
    // Preserve completed responses directly
    setQuestionnaireResponses(completedResponses);
    setIsSkippedQuestionnaire(false);

    // Step 6: Calculate questionnaire exploratory classification
    const qScoresResult = calculateQuestionnaireScores(completedResponses);
    setQuestionnaireResult(qScoresResult);

    // Step 7 & 8: Comparative assessment & agreement analysis
    const compResult = compareAssessments(aiResult, qScoresResult);
    setComparisonResult(compResult);

    // Step 9: Dual-track recommendations based on reported preferences
    const recs = generatePersonalizedRecommendations({
      imageDosha: aiResult?.dosha,
      questionnaireOutcome: qScoresResult?.outcome,
      responses: completedResponses,
      questionnaireScores: qScoresResult
    });
    setRecommendations(recs);

    // Reuse savedAssessmentId when editing, so the same record is updated.
    setSaveStatus('idle');
    setSaveErrorMessage('');

    // Move to results view (WITHOUT automatically saving - user chooses explicitly)
    setWorkflowStep('results');
  };

  // --- SKIP QUESTIONNAIRE (IMAGE-ONLY FALLBACK) ---
  const handleSkipQuestionnaire = () => {
    setIsSkippedQuestionnaire(true);
    setQuestionnaireResponses({});

    const partialQResult = {
      outcome: 'Skipped (Incomplete)',
      outcomeType: 'incomplete',
      isComplete: false,
      percentages: { vata: 0, pitta: 0, kapha: 0 },
      rawScores: { vata: 0, pitta: 0, kapha: 0 },
      explanation: 'The wellness questionnaire was skipped. Only the computer vision assessment was completed.'
    };
    setQuestionnaireResult(partialQResult);

    const compResult = compareAssessments(aiResult, partialQResult);
    setComparisonResult(compResult);

    const recs = generatePersonalizedRecommendations({
      imageDosha: aiResult?.dosha,
      questionnaireOutcome: 'Skipped (Incomplete)',
      responses: {},
      questionnaireScores: {}
    });
    setRecommendations(recs);

    setSaveStatus('idle');
    setSaveErrorMessage('');
    setWorkflowStep('results');
  };

  // Reset actions
  const handleRestartAll = () => {
    setSelectedImage(null);
    updatePreviewUrl(null);
    setAiResult(null);
    setQuestionnaireResponses({});
    setIsSkippedQuestionnaire(false);
    setQuestionnaireResult(null);
    setComparisonResult(null);
    setRecommendations(null);
    clearPreviousResults();
    setWorkflowStep('capture');
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 mt-6 sm:mt-10 mb-16">

      {/* --- HEADER --- */}
      <div className="mb-8 border-b border-green-100 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1E1E1A] tracking-tight">
              Ayurvedic Dosha Assessment
            </h1>
            <p className="text-gray-600 text-sm sm:text-base mt-1">
              Paired Facial AI (MobileNetV2) & Multi-Step Wellness Questionnaire.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#EFF4EB] text-[#5C7A4E] font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider">
              {userName !== 'Guest' ? `Welcome, ${userName}` : 'Guest Session'}
            </span>
          </div>
        </div>

        {/* Workflow Breadcrumb Indicator */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs font-medium text-gray-400 mt-6 overflow-x-auto pb-1">
          <span className={`flex items-center gap-1.5 ${workflowStep === 'capture' ? 'text-[#5C7A4E] font-bold' : 'text-gray-600'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${workflowStep === 'capture' ? 'bg-[#5C7A4E] text-white' : 'bg-gray-200 text-gray-700'}`}>1</span>
            Photo Analysis
          </span>
          <span>→</span>
          <span className={`flex items-center gap-1.5 ${workflowStep === 'image_ready' ? 'text-[#5C7A4E] font-bold' : workflowStep === 'questionnaire' || workflowStep === 'results' ? 'text-gray-600' : 'text-gray-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${workflowStep === 'image_ready' ? 'bg-[#5C7A4E] text-white' : workflowStep === 'questionnaire' || workflowStep === 'results' ? 'bg-[#8BAD7A] text-white' : 'bg-gray-200 text-gray-700'}`}>2</span>
            AI Prediction
          </span>
          <span>→</span>
          <span className={`flex items-center gap-1.5 ${workflowStep === 'questionnaire' ? 'text-[#5C7A4E] font-bold' : workflowStep === 'results' ? 'text-gray-600' : 'text-gray-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${workflowStep === 'questionnaire' ? 'bg-[#5C7A4E] text-white' : workflowStep === 'results' ? 'bg-[#8BAD7A] text-white' : 'bg-gray-200 text-gray-700'}`}>3</span>
            Questionnaire
          </span>
          <span>→</span>
          <span className={`flex items-center gap-1.5 ${workflowStep === 'results' ? 'text-[#5C7A4E] font-bold' : 'text-gray-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${workflowStep === 'results' ? 'bg-[#5C7A4E] text-white' : 'bg-gray-200 text-gray-700'}`}>4</span>
            Hybrid Synthesis
          </span>
        </div>
      </div>

      {/* --- SAVE STATUS / ERROR BANNER --- */}
      {saveErrorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
          <span className="text-base">⚠️</span>
          <div className="flex-1">
            <strong>Database Notice:</strong> {saveErrorMessage}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW STEP 1: CAPTURE PHOTO OR UPLOAD IMAGE               */}
      {/* ======================================================== */}
      {workflowStep === 'capture' && (
        <div className="flex justify-center animate-fade-in-up">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center w-full max-w-2xl">

            <div className="text-center mb-6">
              <h2 className="text-xl font-bold font-serif text-gray-900">Step 1: Capture Facial Scan</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Ensure even, natural lighting without direct glare or heavy filters.
              </p>
            </div>

            <div className="w-full h-64 sm:h-72 border-2 border-dashed border-[#5C7A4E]/30 rounded-2xl flex items-center justify-center overflow-hidden bg-gray-50 mb-8 relative">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="object-cover w-full h-full" />
              ) : (
                <div className="text-center text-gray-400 p-4">
                  <svg className="mx-auto h-12 w-12 mb-2 text-[#5C7A4E]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm font-medium">No image selected</span>
                  <p className="text-xs text-gray-400 mt-1">Select a photo from your device or take one via webcam</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3 sm:gap-4 w-full justify-center">
              <label className="cursor-pointer bg-white border border-[#5C7A4E] text-[#5C7A4E] px-6 sm:px-8 py-3 rounded-xl font-medium hover:bg-[#EFF4EB] transition-colors shadow-xs text-sm sm:text-base">
                Choose Photo
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>

              <button
                type="button"
                onClick={openCamera}
                className="bg-white border border-[#5C7A4E] text-[#5C7A4E] px-6 sm:px-8 py-3 rounded-xl font-medium hover:bg-[#EFF4EB] transition-colors shadow-xs flex items-center gap-2 text-sm sm:text-base"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Take Photo
              </button>

              <button
                onClick={handleAnalyze}
                disabled={!selectedImage || loading}
                className={`px-8 py-3 rounded-xl font-medium text-white transition-all shadow-xs text-sm sm:text-base ${!selectedImage || loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#5C7A4E] hover:bg-[#8BAD7A]'
                  }`}
              >
                {loading ? 'Analyzing with AI...' : 'Analyze Dosha'}
              </button>
            </div>

            {/* CAMERA MODAL */}
            {isCameraOpen && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col items-center">
                  <h3 className="font-semibold text-gray-800 mb-4 self-start text-base">Position Face in Frame</h3>

                  {cameraError ? (
                    <p className="text-red-600 text-sm mb-4 text-center">{cameraError}</p>
                  ) : (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full rounded-xl bg-black mb-4 aspect-video object-cover"
                    />
                  )}

                  <canvas ref={canvasRef} className="hidden" />

                  <div className="flex gap-3 w-full justify-center">
                    <button
                      type="button"
                      onClick={closeCamera}
                      className="px-5 py-2.5 rounded-xl font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    {!cameraError && (
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="px-6 py-2.5 rounded-xl font-medium text-white bg-[#5C7A4E] hover:bg-[#8BAD7A] transition-colors text-sm"
                      >
                        Capture Photo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW STEP 2: IMAGE RESULT READY                          */}
      {/* ======================================================== */}
      {workflowStep === 'image_ready' && aiResult && (
        <div className="flex justify-center animate-fade-in-up">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-[#5C7A4E]/20 flex flex-col items-center w-full max-w-2xl text-center">

            <div className="w-16 h-16 rounded-full bg-[#EFF4EB] flex items-center justify-center text-3xl mb-4 text-[#5C7A4E]">
              ✨
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-[#5C7A4E] mb-1">
              AI Detection Complete
            </span>
            <h2 className="text-4xl font-extrabold text-[#1E1E1A] font-serif mb-2">
              {aiResult.dosha}
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Model Confidence: <strong className="text-gray-900">{aiResult.confidence}%</strong> (MobileNetV2)
            </p>

            <div className="p-5 rounded-xl bg-gray-50 border border-gray-100 mb-8 max-w-lg text-left text-xs sm:text-sm text-gray-600 space-y-2">
              <p className="font-semibold text-gray-800">Next Step: Enhance with Holistic Wellness Questionnaire</p>
              <p>
                Computer vision only captures the outer photographic surface. To complete your full Ayurvedic assessment, our 15-question wellness survey compares your current skin with your constitutional habits and lifestyle.
              </p>
            </div>

            {/* STEP 4: PRIMARY BUTTON "Continue to Wellness Questionnaire" */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
              <button
                type="button"
                onClick={handleContinueToQuestionnaire}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-medium text-white bg-[#5C7A4E] hover:bg-[#8BAD7A] shadow-md transition-all transform hover:-translate-y-0.5 text-base"
              >
                Continue to Wellness Questionnaire →
              </button>

              <button
                type="button"
                onClick={handleSkipQuestionnaire}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
              >
                View Image-Only Result
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW STEP 3: MULTI-STEP QUESTIONNAIRE (PRESERVES ANSWERS)*/}
      {/* ======================================================== */}
      {workflowStep === 'questionnaire' && (
        <div className="animate-fade-in-up">
          <QuestionnaireStepper
            initialResponses={questionnaireResponses}
            onComplete={handleCompleteQuestionnaire}
            onSkip={handleSkipQuestionnaire}
            onBackToImage={() => setWorkflowStep('image_ready')}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW STEP 4: HYBRID RESULTS                              */}
      {/* ======================================================== */}
      {workflowStep === 'results' && (
        <div className="animate-fade-in-up">
          <HybridAssessmentResults
            imageResult={aiResult}
            imagePreviewUrl={previewUrl}
            questionnaireResult={questionnaireResult}
            comparisonResult={comparisonResult}
            recommendations={recommendations}
            onRetakeQuestionnaire={() => setWorkflowStep('questionnaire')}
            onRetakeImage={() => {
              setWorkflowStep('capture');
              setAiResult(null);
              clearPreviousResults();
            }}
            onRestartAll={handleRestartAll}
            onSaveToDatabase={handleSaveToBackend}
            saveStatus={saveStatus}
          />
        </div>
      )}

    </div>
  );
}