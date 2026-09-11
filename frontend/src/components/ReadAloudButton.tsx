import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Volume2, Square, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ReadAloudButtonProps {
  textToRead: string;
  label?: string;
  className?: string;
}

export const ReadAloudButton: React.FC<ReadAloudButtonProps> = ({ textToRead, label = 'Hear Scheme', className = '' }) => {
  const { language, t } = useLanguage();
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stop playback if component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setPlaying(false);
    setLoading(false);
  };

  const handleReadAloud = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // IF PLAYING OR LOADING -> STOP IMMEDIATELY
    if (playing || loading) {
      stopPlayback();
      return;
    }

    // Stop any existing speech playing globally before starting new
    stopPlayback();
    setLoading(true);

    try {
      const res = await axios.post('/api/voice/tts', {
        text: textToRead,
        language,
        speed: 'slow',
      });

      if (res.data?.audioBase64) {
        const audio = new Audio(res.data.audioBase64);
        audioRef.current = audio;
        setPlaying(true);
        setLoading(false);
        audio.play().catch(() => {});
        audio.onended = () => {
          setPlaying(false);
          audioRef.current = null;
        };
      } else if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToRead);
        const langCodes: Record<string, string> = {
          en: 'en-IN',
          hi: 'hi-IN',
          ta: 'ta-IN',
          te: 'te-IN',
          mr: 'mr-IN',
          bn: 'bn-IN',
          ml: 'ml-IN',
          kn: 'kn-IN',
        };
        utterance.lang = langCodes[language] || 'en-IN';
        utterance.rate = 0.85;
        utterance.onend = () => setPlaying(false);
        utterance.onerror = () => setPlaying(false);
        setPlaying(true);
        setLoading(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.warn('[ReadAloud fallback triggered]', err);
      // Client-side Web Speech fallback
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToRead);
        const langCodes: Record<string, string> = {
          en: 'en-IN',
          hi: 'hi-IN',
          ta: 'ta-IN',
          te: 'te-IN',
          mr: 'mr-IN',
          bn: 'bn-IN',
          ml: 'ml-IN',
          kn: 'kn-IN',
        };
        utterance.lang = langCodes[language] || 'en-IN';
        utterance.rate = 0.85;
        utterance.onend = () => setPlaying(false);
        utterance.onerror = () => setPlaying(false);
        setPlaying(true);
        setLoading(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setLoading(false);
      }
    }
  };

  const getStopLabel = () => {
    if (language === 'ta') return 'நிறுத்து';
    if (language === 'hi') return 'रोकें';
    if (language === 'te') return 'ఆపు';
    if (language === 'mr') return 'थांबवा';
    if (language === 'bn') return 'থামুন';
    if (language === 'ml') return 'നിർത്തുക';
    if (language === 'kn') return 'ನಿಲ್ಲಿಸಿ';
    return 'Stop';
  };

  return (
    <button
      onClick={handleReadAloud}
      type="button"
      className={`inline-flex items-center gap-1.5 font-bold text-xs px-3 py-1.5 rounded-lg border shadow-sm transition ${
        playing
          ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-300'
          : 'bg-[#006699]/10 hover:bg-[#006699]/20 text-[#006699] border-[#006699]/30'
      } ${className}`}
      title="Read Aloud in selected language"
    >
      {loading ? (
        <>
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#006699]" />
          <span>Loading...</span>
        </>
      ) : playing ? (
        <>
          <Square className="w-3.5 h-3.5 text-red-600 fill-current animate-pulse" />
          <span className="text-red-700 font-extrabold">{getStopLabel()}</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5 text-[#006699]" />
          <span>🔊 {label}</span>
        </>
      )}
    </button>
  );
};
