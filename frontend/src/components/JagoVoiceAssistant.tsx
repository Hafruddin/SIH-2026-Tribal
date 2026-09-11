import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJago } from '../context/JagoContext';
import { useLanguage } from '../context/LanguageContext';
import { languageNames, Language } from '../i18n/translations';
import { Mic, Volume2, X, Send, RefreshCw, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const JagoVoiceAssistant: React.FC = () => {
  const {
    jagoState,
    statusMessage,
    chatHistory,
    isOpen,
    setIsOpen,
    speechSpeed,
    setSpeechSpeed,
    handleMicClick,
    sendTextMessage,
    stopJago,
  } = useJago();

  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, jagoState]);

  // Voice Navigation listener
  useEffect(() => {
    if (chatHistory.length > 0) {
      const lastMsg = chatHistory[chatHistory.length - 1];
      if (lastMsg.sender === 'user') {
        const text = lastMsg.displayText.toLowerCase();
        if (text.includes('open scholarship') || text.includes('view schemes') || text.includes('show schemes')) {
          navigate('/student/schemes');
        } else if (text.includes('application') || text.includes('my status') || text.includes('track')) {
          navigate('/student/applications');
        } else if (text.includes('payment') || text.includes('dbt') || text.includes('money')) {
          navigate('/student/dashboard');
        } else if (text.includes('document') || text.includes('vault') || text.includes('certificate')) {
          navigate('/student/documents');
        } else if (text.includes('grievance') || text.includes('complaint')) {
          navigate('/student/grievance');
        } else if (text.includes('profile')) {
          navigate('/student/profile');
        } else if (text.includes('notification') || text.includes('announcement')) {
          navigate('/student/announcements');
        } else if (text.includes('eligible') || text.includes('eligibility')) {
          navigate('/student/eligibility');
        }
      }
    }
  }, [chatHistory, navigate]);

  const handleSend = async (overrideText?: string) => {
    const text = overrideText || inputText;
    if (!text.trim()) return;
    setInputText('');
    await sendTextMessage(text);
  };

  const getButtonLabel = () => {
    if (language === 'ta') return 'JAGO வாய்ஸ் உதவி';
    if (language === 'hi') return 'जागो आवाज सहायता';
    if (language === 'te') return 'JAGO వాయిస్ హెలప్';
    return 'Ask JAGO Voice Assistant';
  };

  return (
    <div id="jago-voice" className="fixed bottom-5 right-5 z-50">
      {/* 1. FLOATING TRIGGER BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-[#8B4513] via-[#5C2E0B] to-[#E67E22] text-white px-5 py-3.5 rounded-full shadow-2xl hover:scale-105 transition flex items-center space-x-3 border-2 border-white group"
          aria-label="Open JAGO Voice Assistant"
        >
          <div className="relative">
            <Mic className="w-6 h-6 animate-pulse text-amber-300" />
            <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
              jagoState === 'connected' || jagoState === 'listening' ? 'bg-green-400' : 'bg-amber-400'
            }`}></span>
          </div>
          <div className="text-left leading-tight">
            <span className="font-extrabold text-sm block tracking-wide">{getButtonLabel()}</span>
            <span className="text-[10px] text-orange-200 block uppercase font-medium">Multilingual AI Voice Assistant</span>
          </div>
        </button>
      )}

      {/* 2. VOICE-FIRST ACCESSIBLE DRAWER */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-300 w-[92vw] sm:w-[440px] h-[660px] max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#8B4513] via-[#5C2E0B] to-[#004466] text-white p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#E67E22] text-white font-black text-xl flex items-center justify-center border-2 border-white shadow-inner">
                🎙️
              </div>
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2">
                  JAGO Voice Assistant
                </h3>
                <p className="text-[11px] text-orange-200">Voice-First Tribal Scholarship Guide</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSpeechSpeed(speechSpeed === 'slow' ? 'normal' : 'slow')}
                className="bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold px-2 py-1 rounded border border-white/30"
                title="Toggle Voice Speed"
              >
                {speechSpeed === 'slow' ? '🐢 Slow' : '▶ Normal'}
              </button>

              <button
                onClick={() => {
                  stopJago();
                  setIsOpen(false);
                }}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
                aria-label="Close JAGO"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Connection Status Bar */}
          <div className="bg-slate-100 px-4 py-2 border-b border-gray-200 flex justify-between items-center text-xs">
            <div className="flex items-center space-x-2 font-semibold">
              {jagoState === 'connected' ? (
                <span className="flex items-center gap-1.5 text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full border border-green-300">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                  ● JAGO Connected
                </span>
              ) : jagoState === 'listening' ? (
                <span className="flex items-center gap-1.5 text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full border border-green-300">
                  <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
                  🎙 Listening...
                </span>
              ) : jagoState === 'agent_speaking' ? (
                <span className="flex items-center gap-1.5 text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-300">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></span>
                  🔊 JAGO is speaking...
                </span>
              ) : jagoState === 'processing' ? (
                <span className="flex items-center gap-1.5 text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                  <RefreshCw className="w-3 h-3 animate-spin text-amber-700" />
                  Thinking...
                </span>
              ) : jagoState === 'connecting' || jagoState === 'reconnecting' ? (
                <span className="flex items-center gap-1.5 text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-300">
                  <RefreshCw className="w-3 h-3 animate-spin text-blue-700" />
                  {jagoState === 'reconnecting' ? 'Reconnecting...' : 'Connecting...'}
                </span>
              ) : jagoState === 'error' ? (
                <span className="flex items-center gap-1.5 text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full border border-red-300">
                  <AlertCircle className="w-3 h-3 text-red-600" />
                  Connection failed — Tap to retry
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-gray-700 bg-gray-200 px-2.5 py-0.5 rounded-full border border-gray-300">
                  ● Ready
                </span>
              )}
            </div>

            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="text-[11px] bg-white border border-gray-300 rounded px-2 py-1 font-semibold text-gray-700 focus:ring-1 focus:ring-[#8B4513]"
            >
              {Object.entries(languageNames).map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Primary Voice Mic Area */}
          <div className="bg-amber-50/60 p-5 border-b border-amber-200 text-center flex flex-col items-center justify-center space-y-3">
            <button
              onClick={handleMicClick}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-2xl transition transform hover:scale-105 ${
                jagoState === 'listening'
                  ? 'bg-red-600 ring-8 ring-red-200 animate-pulse'
                  : jagoState === 'agent_speaking'
                  ? 'bg-green-600 ring-8 ring-green-200 animate-bounce'
                  : jagoState === 'connecting' || jagoState === 'processing' || jagoState === 'reconnecting'
                  ? 'bg-[#006699] ring-8 ring-blue-200'
                  : jagoState === 'error'
                  ? 'bg-red-700 ring-4 ring-red-200'
                  : 'bg-gradient-to-r from-[#8B4513] to-[#E67E22] ring-4 ring-orange-200'
              }`}
              aria-label="Microphone Button"
            >
              {jagoState === 'listening' ? (
                <Mic className="w-10 h-10 text-white animate-ping" />
              ) : jagoState === 'agent_speaking' ? (
                <Volume2 className="w-10 h-10 text-white animate-pulse" />
              ) : jagoState === 'connecting' || jagoState === 'processing' || jagoState === 'reconnecting' ? (
                <RefreshCw className="w-9 h-9 text-white animate-spin" />
              ) : (
                <Mic className="w-10 h-10 text-white" />
              )}
            </button>

            <div className="text-center">
              <span className="font-extrabold text-sm text-[#8B4513] block">
                {statusMessage}
              </span>
              <span className="text-[11px] text-amber-800 font-medium block">
                No typing required • Speaks English, Hindi, Tamil, Telugu, Marathi, Bengali, Kannada
              </span>
            </div>
          </div>

          {/* Chat / Voice Output Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {chatHistory.map((item) => (
              <div
                key={item.id}
                className={`flex flex-col ${
                  item.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-sm leading-relaxed ${
                    item.sender === 'user'
                      ? 'bg-[#8B4513] text-white rounded-br-none font-medium'
                      : 'bg-white border border-amber-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {item.studentContextUsed && (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-bold mb-1.5 border border-green-300">
                      <ShieldCheck className="w-3 h-3 text-green-600" />
                      Verified Profile Data Used
                    </span>
                  )}

                  <p className="whitespace-pre-line text-sm">{item.displayText}</p>

                  {/* Quick Action Chips */}
                  {item.quickActions && item.quickActions.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-gray-100 flex flex-wrap gap-1.5">
                      {item.quickActions.map((action, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleSend(action)}
                          className="bg-amber-100 hover:bg-amber-200 text-[#8B4513] font-bold text-[11px] px-2.5 py-1 rounded-full border border-amber-300 transition flex items-center gap-1"
                        >
                          {action}
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[9px] text-gray-400 mt-1 block text-right font-medium">
                    {item.timestamp}
                  </span>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Text Input Fallback Bar */}
          <div className="p-3 bg-white border-t border-gray-200 flex items-center space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your scholarship question..."
              disabled={jagoState === 'processing'}
              className="flex-1 border border-gray-300 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-[#8B4513] focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={jagoState === 'processing' || !inputText.trim()}
              className="bg-[#8B4513] hover:bg-[#5C2E0B] text-white p-2.5 rounded-xl shadow-md transition disabled:opacity-50"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
