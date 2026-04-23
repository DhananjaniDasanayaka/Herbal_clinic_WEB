import { useState, useEffect } from 'react';

export default function ProgressTracker() {
  const [logs, setLogs] = useState([]);
  const [stressLevel, setStressLevel] = useState(5);
  const [skinCondition, setSkinCondition] = useState('Normal');

  // Load existing logs when the page loads
  useEffect(() => {
    const savedLogs = JSON.parse(localStorage.getItem('wellnessLogs')) || [];
    setLogs(savedLogs);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newLog = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      stress: stressLevel,
      skin: skinCondition,
    };

    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    
    // Save to browser storage
    localStorage.setItem('wellnessLogs', JSON.stringify(updatedLogs));
    
    // Reset form
    setStressLevel(5);
    setSkinCondition('Normal');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl mt-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Stress & Skin Tracker</h1>
        <p className="text-gray-600 mb-8">
          Log your daily stress levels and skin condition to track your progress over time.
        </p>

        {/* Input Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Today's Stress Level: <span className="text-blue-600">{stressLevel}/10</span>
              </label>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={stressLevel}
                onChange={(e) => setStressLevel(e.target.value)}
                className="w-full cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Very Calm (1)</span>
                <span>Highly Stressed (10)</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                How does your skin feel today?
              </label>
              <select 
                value={skinCondition}
                onChange={(e) => setSkinCondition(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Clear & Hydrated">Clear & Hydrated</option>
                <option value="Normal">Normal</option>
                <option value="Dry & Flaky">Dry & Flaky</option>
                <option value="Oily & Congested">Oily & Congested</option>
                <option value="Inflamed / Breakouts">Inflamed / Breakouts</option>
              </select>
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Save Daily Log
            </button>
          </form>
        </div>

        {/* History Log */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">Your History</h2>
        {logs.length === 0 ? (
          <p className="text-gray-500 italic">No logs yet. Start tracking today!</p>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800">{log.date}</p>
                  <p className="text-sm text-gray-600">Skin: {log.skin}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-bold">
                    Stress: {log.stress}/10
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}