import { useState, useRef, useEffect } from 'react';

export default function MeditationPlayer({ title, audioSrc }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(audioSrc);
  const [audioError, setAudioError] = useState(null);
  
  const audioRef = useRef(null);

  useEffect(() => {
    setCurrentSrc(audioSrc);
    setAudioError(null);
    setIsPlaying(false);
    setCurrentTime(0);
  }, [audioSrc]);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        setAudioError(null);
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn('Audio playback error:', err);
        setIsPlaying(false);
        // If the current audio file failed, fallback to a verified track
        if (currentSrc !== '/audio/vata-audio.mp3') {
          console.log('Attempting safe fallback to /audio/vata-audio.mp3');
          setCurrentSrc('/audio/vata-audio.mp3');
        } else {
          setAudioError('Audio track is currently unavailable.');
        }
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioError = () => {
    console.warn(`Audio track failed to load: ${currentSrc}`);
    // Safe fallback to verified harmonic track
    if (currentSrc !== '/audio/vata-audio.mp3') {
      setCurrentSrc('/audio/vata-audio.mp3');
    } else {
      setAudioError('Meditation audio is currently offline.');
    }
  };

  const handleSeek = (e) => {
    const newTime = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-xl border border-blue-100 p-5 shadow-sm mt-4">
      {/* Hidden audio element with fallback and error listeners */}
      <audio 
        ref={audioRef} 
        src={currentSrc} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onError={handleAudioError}
        onEnded={() => setIsPlaying(false)} 
      />

      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500">
            {audioError ? (
              <span className="text-amber-600">{audioError}</span>
            ) : (
              'Guided Session'
            )}
          </p>
        </div>
        <button 
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause meditation session' : 'Play meditation session'}
          className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
            isPlaying ? 'bg-blue-100 text-blue-600' : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isPlaying ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
      
      {/* Real Synced Progress Bar */}
      <input 
        type="range" 
        min="0" 
        max={duration || 100} 
        value={currentTime} 
        onChange={handleSeek}
        className="w-full accent-blue-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      
      <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}