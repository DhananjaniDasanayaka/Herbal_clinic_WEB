import { useLocation, Link } from 'react-router-dom';

import { useState, useEffect } from 'react';

import MeditationPlayer from '../components/MeditationPlayer';

import SkincareChecklist from '../components/SkincareChecklist';
import AssessmentHistory from '../components/AssessmentHistory';

export default function Dashboard() {

  const location = useLocation();

  const passedSkinType = location.state?.skinType;

  const [skinType, setSkinType] = useState(passedSkinType || null);

  const [userName, setUserName] = useState('Guest');

  const [historyError, setHistoryError] = useState('');

  const [assessmentHistory, setAssessmentHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const latestAssessment = assessmentHistory[0] || null;

  // Update both the recent snapshot and list immediately after an owned record is deleted.
  const handleAssessmentDeleted = (deletedId) => {
    setAssessmentHistory((current) => current.filter((entry) => entry._id !== deletedId));
  };

  useEffect(() => {

    const fetchUserDataAndAssessments = async () => {

      try {

        const savedUser = JSON.parse(localStorage.getItem('herbalUser'));

        if (savedUser && savedUser.name) {

          const firstName = savedUser.name.split(' ')[0];

          setUserName(firstName);

        }

        const token = localStorage.getItem('token');

        if (!token) {

          setHistoryError('Please log in to view your saved assessments.');
          setLoading(false);

          return;

        }

        // 1. Fetch user profile

        const userRes = await fetch('http://localhost:5000/api/auth/me', {

          headers: {

            'Authorization': `Bearer ${token}`

          }

        });

        if (userRes.ok) {

          const userData = await userRes.json();

          if (userData.name) setUserName(userData.name.split(' ')[0]);

          if (!passedSkinType && userData.skinType) {

            setSkinType(userData.skinType.toLowerCase());

          }

        }

        // 2. Fetch assessment history

        const assessRes = await fetch('http://localhost:5000/api/assessments', {

          headers: {

            'Authorization': `Bearer ${token}`

          }

        });

        if (assessRes.ok) {

          const history = await assessRes.json();

          setAssessmentHistory(history);
          setHistoryError('');

          if (history.length > 0) {

            if (!passedSkinType && !skinType) {

              // A mixed or dual questionnaire is not automatically a single-dosha profile.
              const single = ['Vata', 'Pitta', 'Kapha'].includes(history[0].questionnaireOutcome)
                ? history[0].questionnaireOutcome
                : null;
              const primaryDosha = (single || history[0].imagePrediction || '').toLowerCase();
              if (['vata', 'pitta', 'kapha', 'balanced'].includes(primaryDosha)) {
                setSkinType(primaryDosha);
              }

            }

          }

        } else {
          setHistoryError('Could not load assessment history. Check your backend connection and sign in again if needed.');
        }

      } catch (err) {

        console.error('Error fetching dashboard assessment data:', err);
        setHistoryError('Could not load assessment history. Check that the backend is running.');

      } finally {

        setLoading(false);

      }

    };

    fetchUserDataAndAssessments();

  }, [passedSkinType]);

  const regimenData = {

    vata: {

      title: "Vata (Dry/Thin Skin)",

      skincareTasks: ["Drink warm water with ginger", "Gently massage face with warm sesame oil", "Use a hydrating cleanser", "Avoid harsh foaming soaps"],

      meditationTitle: "Grounding Breathwork",

      meditationDesc: "Focus on deep, slow breathing to calm the nervous system.",

      audioSrc: "/audio/vata-audio.mp3"

    },

    pitta: {

      title: "Pitta (Sensitive/Warm Skin)",

      skincareTasks: ["Drink coriander seed water", "Apply cooling aloe vera gel", "Spritz pure rose water", "Avoid peak afternoon sun"],

      meditationTitle: "Cooling Visualization",

      meditationDesc: "Practice mindfulness to release anger and heat from the body.",

      audioSrc: "/audio/pitta-audio.mp3"

    },

    kapha: {

      title: "Kapha (Oily/Thick Skin)",

      skincareTasks: ["Wash face with warm water", "Use a gentle herbal exfoliant", "Apply light jojoba oil", "Steam face with tulsi"],

      meditationTitle: "Energizing Flow",

      meditationDesc: "Focus on releasing sluggishness and stimulating circulation.",

      audioSrc: "/audio/kapha-audio.mp3"

    },

    balanced: {

      title: "Balanced (Harmonious Skin)",

      skincareTasks: ["Drink plenty of water", "Cleanse face gently twice daily", "Apply light herbal moisturizer", "Get 7-8 hours restful sleep"],

      meditationTitle: "Equilibrium Meditation",

      meditationDesc: "Cultivate awareness and harmony across your daily routines.",

      audioSrc: "/audio/balanced-audio.mp3"

    }

  };

  const normalizedSkinKey = (skinType || 'balanced').toLowerCase();

  const userRegimen = regimenData[normalizedSkinKey] || regimenData.balanced;

  return (

    <div className="min-h-screen bg-[#FAF7F2] p-4 sm:p-6 flex flex-col items-center">

      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mt-6 sm:mt-10 mb-12">

        {/* Personalized Greeting */}

        <div className="mb-8 border-b border-gray-100 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div>

            <p className="text-sm text-gray-500 font-medium flex items-center">

              Welcome back <span className="ml-1.5 text-lg">👋</span>

            </p>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 capitalize tracking-tight mt-1 font-serif">

              {userName}

            </h1>

          </div>

          <Link

            to="/assessment"

            className="inline-flex items-center gap-2 self-start sm:self-auto bg-[#5C7A4E] hover:bg-[#8BAD7A] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-xs"

          >

            <span>✨</span> Take New Assessment

          </Link>

        </div>

        {/* Dosha Status Overview */}

        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-[#EFF4EB] to-white border border-[#5C7A4E]/20">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

            <div>

              <span className="text-xs uppercase font-bold text-[#5C7A4E] tracking-wider">

                Primary Ayurvedic Profile

              </span>

              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 capitalize font-serif">

                {skinType ? skinType : 'Assessment Pending'}

              </h2>

              <p className="text-sm text-gray-600 mt-1 max-w-xl">

                {skinType

                  ? `Your regimen is tuned to pacify ${skinType} dosha and reinforce your cutaneous barrier.`

                  : 'You have not completed an assessment yet. Discover your unique dosha profile in minutes.'}

              </p>

            </div>

            {!skinType && (

              <Link

                to="/assessment"

                className="px-6 py-3 rounded-xl bg-[#5C7A4E] text-white font-medium text-sm text-center shadow-xs"

              >

                Start Assessment Now

              </Link>

            )}

          </div>

        </div>

        {/* Latest Hybrid Assessment Snapshot (if available) */}

        {latestAssessment && (

          <div className="mb-8 p-6 rounded-2xl border border-gray-200 bg-gray-50/70">

            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200/60">

              <span className="text-xs font-bold uppercase tracking-wider text-gray-700">

                Latest Hybrid AI Assessment

              </span>

              <span className="text-xs text-gray-500">

                {new Date(latestAssessment.createdAt).toLocaleDateString()}

              </span>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mt-3">

              <div className="bg-white p-3.5 rounded-xl border border-gray-100">

                <span className="text-xs text-gray-400 block font-medium">Vision Prediction:</span>

                <span className="font-bold text-gray-900">{latestAssessment.imagePrediction}</span>

                <span className="text-xs text-gray-500 ml-1.5">({latestAssessment.imageConfidence}%)</span>

              </div>

              <div className="bg-white p-3.5 rounded-xl border border-gray-100">

                <span className="text-xs text-gray-400 block font-medium">Questionnaire Profile:</span>

                <span className="font-bold text-gray-900">{latestAssessment.questionnaireOutcome}</span>

              </div>

              <div className="bg-white p-3.5 rounded-xl border border-gray-100">

                <span className="text-xs text-gray-400 block font-medium">Agreement Status:</span>

                <span className="font-bold capitalize text-[#5C7A4E]">

                  {latestAssessment.agreementStatus || 'Comparative'}

                </span>

              </div>

            </div>

            {latestAssessment.agreementSummary && (

              <p className="text-xs text-gray-600 mt-3 italic">

                "{latestAssessment.agreementSummary}"

              </p>

            )}

          </div>

        )}

        {/* Daily Routine Cards */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

          <div className="bg-[#EFF4EB]/40 p-6 rounded-2xl border border-[#5C7A4E]/20">

            <h2 className="text-xl font-semibold text-[#5C7A4E] mb-2 font-serif">

              Daily Skincare Plan

            </h2>

            <p className="text-gray-700 font-medium mb-3 text-sm">{userRegimen.title}</p>

            <SkincareChecklist tasks={userRegimen.skincareTasks} />

          </div>

          <div className="bg-sky-50/50 p-6 rounded-2xl border border-sky-100">

            <h2 className="text-xl font-semibold text-sky-800 mb-2 font-serif">

              Mindfulness & Meditation

            </h2>

            <p className="text-gray-600 mb-4 text-sm">{userRegimen.meditationDesc}</p>

            <MeditationPlayer

              title={userRegimen.meditationTitle}

              duration="10"

              audioSrc={userRegimen.audioSrc}

            />

          </div>

        </div>

        {/* Reusable detailed history: view all, view record, and confirmed delete */}
        <AssessmentHistory
          history={assessmentHistory}
          loading={loading}
          error={historyError}
          onDeleted={handleAssessmentDeleted}
        />

      </div>
    </div>
  );
}
