import { useLocation, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react'; // 1. Import hooks for managing the user's name
import MeditationPlayer from '../components/MeditationPlayer';
import SkincareChecklist from '../components/SkincareChecklist';

export default function Dashboard() {
  const location = useLocation();
  const skinType = location.state?.skinType;
  const [userName, setUserName] = useState('Guest');

  // 2. When the dashboard loads, check if a user created an account
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('herbalUser'));
    if (savedUser && savedUser.name) {
      // Extract just the first name for a friendlier greeting
      const firstName = savedUser.name.split(' ')[0];
      setUserName(firstName);
    }
  }, []);

  if (!skinType) {
    return <Navigate to="/assessment" />;
  }

  const regimenData = {
    vata: {
      title: "Vata (Dry/Thin Skin)",
      skincareTasks: ["Drink warm water with ginger", "Gently massage face with warm sesame oil", "Use a hydrating cleanser"],
      meditationTitle: "Grounding Breathwork",
      meditationDesc: "Focus on deep, slow breathing to calm the nervous system.",
      audioSrc: "/audio/vata-audio.mp3" // Add this!
    },
    pitta: {
      title: "Pitta (Sensitive/Warm Skin)",
      skincareTasks: ["Drink coriander seed water", "Apply cooling aloe vera gel", "Spritz pure rose water"],
      meditationTitle: "Cooling Visualization",
      meditationDesc: "Practice mindfulness to release anger and heat from the body.",
      audioSrc: "/audio/pitta-audio.mp3" // Add this!
    },
    kapha: {
      title: "Kapha (Oily/Thick Skin)",
      skincareTasks: ["Wash face with warm water", "Use a gentle herbal exfoliant", "Apply light jojoba oil"],
      meditationTitle: "Energizing Flow",
      meditationDesc: "Focus on releasing sluggishness and stimulating circulation.",
      audioSrc: "/audio/kapha-audio.mp3" // Add this!
    }
  };

  const userRegimen = regimenData[skinType];

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-8 mt-10">
        
        {/* 3. The new Personalized Greeting */}
        <div className="mb-8 border-b border-gray-100 pb-6">
          <p className="text-lg text-gray-500 font-medium flex items-center">
            Welcome back <span className="ml-2 text-xl">👋</span>
          </p>
          <h1 className="text-4xl font-extrabold text-gray-900 capitalize tracking-tight mt-1">
            {userName}
          </h1>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Personalized Routine</h2>
          <p className="text-gray-600">
            Based on your assessment, your primary Ayurvedic skin dosha is <span className="font-bold capitalize text-green-700">{skinType}</span>.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 p-6 rounded-lg border border-green-100">
            <h2 className="text-xl font-semibold text-green-800 mb-3">Daily Skincare Plan</h2>
            <p className="text-green-900 font-medium mb-2">{userRegimen.title}</p>
            <SkincareChecklist tasks={userRegimen.skincareTasks} />
          </div>
          
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
            <h2 className="text-xl font-semibold text-blue-800 mb-3">Meditation Plan</h2>
            <p className="text-blue-700 mb-4">{userRegimen.meditationDesc}</p>
            <MeditationPlayer 
                title={userRegimen.meditationTitle} 
                duration="10" 
                audioSrc={userRegimen.audioSrc}
            />
          </div>
        </div>

      </div>
    </div>
  );
}