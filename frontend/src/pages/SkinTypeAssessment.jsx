import { useState, useEffect } from 'react';
import MeditationPlayer from '../components/MeditationPlayer'; 
import SkincareChecklist from '../components/SkincareChecklist'; // 1. Imported your checklist!

export default function SkinTypeAssessment() {
  const [userName, setUserName] = useState('Guest'); 
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- FETCH USER NAME FROM DB ON LOAD ---
  useEffect(() => {
    const fetchUserFromDB = async () => {
      try {
        const token = localStorage.getItem('token'); 
        if (!token) return;

        const response = await fetch('http://localhost:5000/api/auth/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUserName(userData.name); 
        }
      } catch (error) {
        console.error("Failed to connect to backend:", error);
      }
    };

    fetchUserFromDB();
  }, []);

  // --- SAVE THE AI RESULT TO MONGODB ---
  const saveDoshaToDB = async (doshaResult) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/auth/update-dosha', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ skinType: doshaResult })
      });

      if (response.ok) {
        console.log("✅ Dosha successfully saved to database!");
      }
    } catch (error) {
      console.error("Failed to save Dosha to DB:", error);
    }
  };

  // --- GET THE RIGHT AUDIO TRACK ---
  const getDoshaAudio = (dosha) => {
    switch(dosha.toLowerCase()) {
      case 'vata': return '/audio/vata-audio.mp3';
      case 'pitta': return '/audio/pitta-audio.mp3';
      case 'kapha': return '/audio/kapha-audio.mp3';
      default: return '/audio/balanced-audio.mp3';
    }
  };

  // --- 2. GET THE RIGHT CHECKLIST TASKS ---
  const getDoshaTasks = (dosha) => {
    switch(dosha.toLowerCase()) {
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

  // --- AI IMAGE FUNCTIONS ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAiResult(null); 
    }
  };

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
        saveDoshaToDB(data.dosha); 
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error("Connection error:", error);
      alert('Could not connect to the AI server. Is Python running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 mt-10">
      
      <div className="mb-10 border-b border-green-100 pb-6">
        <h1 className="text-4xl font-bold text-green-800 mb-2">Hi, {userName} 👋</h1>
        <p className="text-gray-600 text-lg">Welcome to your daily Ayurvedic assessment. Let's analyze your current Dosha.</p>
      </div>

      <div className="flex justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center w-full max-w-2xl">
          
          <div className="w-full h-64 border-2 border-dashed border-green-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50 mb-8">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="object-cover w-full h-full" />
            ) : (
              <div className="text-center text-gray-400">
                <svg className="mx-auto h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>No image selected</span>
              </div>
            )}
          </div>

          <div className="flex space-x-4 w-full justify-center">
            <label className="cursor-pointer bg-white border border-green-600 text-green-700 px-8 py-3 rounded-lg font-medium hover:bg-green-50 transition-colors shadow-sm">
              Choose Photo
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
            
            <button 
              onClick={handleAnalyze} 
              disabled={!selectedImage || loading}
              className={`px-8 py-3 rounded-lg font-medium text-white transition-colors shadow-sm ${!selectedImage || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {loading ? 'Analyzing...' : 'Analyze Dosha'}
            </button>
          </div>

          {/* --- AI RESULT, MEDIA PLAYER & CHECKLIST --- */}
          {aiResult && (
            <div className="mt-10 w-full animate-fade-in-up">
              <div className="p-5 bg-green-50 rounded-xl text-center border border-green-200 mb-6 shadow-inner">
                <p className="text-green-700 text-sm font-medium mb-1 uppercase tracking-wider">AI Detection Complete</p>
                <p className="font-extrabold text-green-900 text-3xl">{aiResult.dosha}</p>
              </div>

              {/* Your custom Audio Player! */}
              <div className="mb-6">
                <MeditationPlayer 
                  title={`${aiResult.dosha} Balancing Routine`} 
                  audioSrc={getDoshaAudio(aiResult.dosha)} 
                />
              </div>

              {/* 3. YOUR NEW DYNAMIC CHECKLIST! */}
              <div className="bg-white rounded-xl border border-green-100 p-5 shadow-sm">
                <h3 className="font-semibold text-gray-800 border-b border-gray-100 pb-2 mb-2">
                  Your Daily {aiResult.dosha} Tasks
                </h3>
                <SkincareChecklist tasks={getDoshaTasks(aiResult.dosha)} />
              </div>

            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}