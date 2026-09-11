import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ConversationProvider, useConversation } from '@elevenlabs/react';
import { useLanguage } from './LanguageContext';
import { useAuth } from './AuthContext';
import { Language } from '../i18n/translations';

export type JagoState =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'listening'
  | 'user_speaking'
  | 'processing'
  | 'agent_speaking'
  | 'reconnecting'
  | 'error';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'jago';
  displayText: string;
  spokenText?: string;
  quickActions?: string[];
  audioBase64?: string;
  studentContextUsed?: boolean;
  timestamp: string;
}

export interface DevDiagnostics {
  apiKeyConfigured: boolean;
  agentIdConfigured: boolean;
  backendReachable: boolean;
  signedUrlGenerated: boolean;
  micPermission: 'GRANTED' | 'DENIED' | 'UNKNOWN';
  elevenLabsConnection: 'CONNECTED' | 'DISCONNECTED' | 'VOICE_READY';
  lastError: string | null;
}

interface JagoContextType {
  jagoState: JagoState;
  statusMessage: string;
  chatHistory: ChatMessage[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  speechSpeed: 'slow' | 'normal';
  setSpeechSpeed: (speed: 'slow' | 'normal') => void;
  diagnostics: DevDiagnostics;
  startJago: () => Promise<void>;
  stopJago: () => void;
  handleMicClick: () => void;
  sendTextMessage: (text: string) => Promise<void>;
  clearHistory: () => void;
}

const JagoContext = createContext<JagoContextType | undefined>(undefined);

const JagoInnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language } = useLanguage();
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [jagoState, setJagoState] = useState<JagoState>('idle');
  const [speechSpeed, setSpeechSpeed] = useState<'slow' | 'normal'>('slow');
  const [statusMessage, setStatusMessage] = useState<string>('Tap Microphone to Speak');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'init_welcome',
      sender: 'jago',
      displayText:
        language === 'ta'
          ? 'வணக்கம்! நான் JAGO. உங்கள் கல்வி உதவித்தொகை தொடர்பாக எப்படி உதவலாம்?'
          : language === 'hi'
          ? 'नमस्ते! मैं JAGO हूँ। छात्रवृत्ति के बारे में पूछिए।'
          : language === 'te'
          ? 'నమస్తే! నేను JAGO. మీ విద్యార్థివేతనం గురించి అడగండి.'
          : 'Namaste! I am JAGO, your Voice Scholarship Guide. Tap the microphone to speak!',
      quickActions: ['Check Eligibility', 'View Schemes', 'Required Documents', 'Payment Status'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [diagnostics, setDiagnostics] = useState<DevDiagnostics>({
    apiKeyConfigured: true,
    agentIdConfigured: true,
    backendReachable: true,
    signedUrlGenerated: false,
    micPermission: 'UNKNOWN',
    elevenLabsConnection: 'DISCONNECTED',
    lastError: null,
  });

  // Prevent duplicate concurrent start calls
  const isStartingRef = useRef(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const processedMessageIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setChatHistory(prev => {
      const newHistory = [...prev];
      if (newHistory.length > 0 && (newHistory[0].id === 'init_welcome' || newHistory[0].id === 'welcome')) {
        const getWelcomeMsg = (lang: string) => {
          switch (lang) {
            case 'ta': return 'வணக்கம்! நான் JAGO, பழங்குடியின மாணவர் உதவித்தொகை வழிகாட்டி. உதவித்தொகை தகுதி, விண்ணப்ப நிலை, அல்லது தேவையான ஆவணங்கள் பற்றி என்னிடம் கேளுங்கள்!';
            case 'hi': return 'नमस्ते! मैं जागो (JAGO), आपका जनजातीय छात्रवृत्ति सहायक हूँ। मुझसे छात्रवृत्ति पात्रता, आवेदन की स्थिति या दस्तावेजों के बारे में पूछें।';
            case 'te': return 'నమస్తే! నేను JAGO, మీ గిరిజన విద్యార్థివేతన సహాయకుడిని. అర్హత, అప్లికేషన్ హోదా లేదా పత్రాల గురించి నన్ను అడగండి!';
            case 'mr': return 'नमस्कार! मी जागो (JAGO), तुमचा आदिवासी शिष्यवृत्ती सहाय्यक आहे. शिष्यवृत्ती पात्रता, अर्जाची स्थिती किंवा कागदपत्रांबद्दल मला विचारा!';
            case 'bn': return 'নমস্কার! আমি জাগো (JAGO), আপনার উপজাতীয় বৃত্তি সহায়ক। বৃত্তি যোগ্যতা, আবেদনের স্থিতি বা নথি সম্পর্কে আমাকে জিজ্ঞাসা করুন!';
            case 'ml': return 'നമസ്കാരം! ഞാൻ ജാഗോ (JAGO), നിങ്ങളുടെ ഗോത്രവർഗ്ഗ സ്കോളർഷിപ്പ് സഹായി. യോഗ്യത, അപേക്ഷാ അവസ്ഥ അല്ലെങ്കിൽ രേഖകളെക്കുറിച്ച് എന്നോട് ചോദിക്കൂ!';
            case 'kn': return 'ನಮಸ್ಕಾರ! ನಾನು ಜಾಗೋ (JAGO), ನಿಮ್ಮ ಪರಿಶಿಷ್ಟ ಪಂಗಡದ ವಿದ್ಯಾರ್ಥಿವೇತನ ಸಹಾಯಕ. ಅರ್ಹತೆ, ಅರ್ಜಿಯ ಸ್ಥಿತಿ ಅಥವಾ ದಾಖಲೆಗಳ ಬಗ್ಗೆ ನನ್ನನ್ನು ಕೇಳಿ!';
            default: return 'Namaste! I am JAGO, your AI Tribal Scholarship Guide. Ask me about scholarship eligibility, tracking application status, or required documents!';
          }
        };
        newHistory[0] = {
          ...newHistory[0],
          displayText: getWelcomeMsg(language),
        };
      }
      return newHistory;
    });
  }, [language]);

  // Web Speech API Language code map
  const getSpeechLangCode = useCallback((lang: string): string => {
    const map: Record<string, string> = {
      en: 'en-IN',
      hi: 'hi-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      mr: 'mr-IN',
      bn: 'bn-IN',
      ml: 'ml-IN',
      kn: 'kn-IN',
    };
    return map[lang] || 'en-IN';
  }, []);

  // 1. ElevenLabs SDK Conversation Hook
  const conversation = useConversation({
    onConnect: () => {
      console.log('[JAGO ElevenLabs] Connected to real-time agent session.');
      setJagoState('connected');
      setStatusMessage('JAGO Connected');
      setDiagnostics(prev => ({ ...prev, elevenLabsConnection: 'CONNECTED', lastError: null }));
    },
    onDisconnect: () => {
      console.log('[JAGO ElevenLabs] Disconnected session.');
      setJagoState('idle');
      setStatusMessage('Tap Microphone to Speak');
      setDiagnostics(prev => ({ ...prev, elevenLabsConnection: 'DISCONNECTED' }));
    },
    onMessage: (msg: any) => {
      console.log('[JAGO ElevenLabs Message]', msg);
      const text = msg?.message || msg?.text;
      const msgId = msg?.id || `${msg?.source}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      if (text && !processedMessageIdsRef.current.has(msgId)) {
        processedMessageIdsRef.current.add(msgId);
        const sender = msg.source === 'user' ? 'user' : 'jago';
        
        setChatHistory(prev => [
          ...prev,
          {
            id: msgId,
            sender,
            displayText: text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    },
    onModeChange: (modeData) => {
      console.log('[JAGO ElevenLabs Mode]', modeData.mode);
      if (modeData.mode === 'speaking') {
        setJagoState('agent_speaking');
        setStatusMessage('JAGO is speaking...');
      } else if (modeData.mode === 'listening') {
        setJagoState('listening');
        setStatusMessage('Listening...');
      }
    },
    onError: (err: any) => {
      console.warn('[JAGO ElevenLabs Error]', err);
      setDiagnostics(prev => ({ ...prev, lastError: typeof err === 'string' ? err : err?.message || 'ElevenLabs connection issue' }));
    },
  });

  // Check backend health on mount
  useEffect(() => {
    axios.get('/api/jago/health')
      .then(res => {
        setDiagnostics(prev => ({
          ...prev,
          backendReachable: true,
          apiKeyConfigured: Boolean(res.data.apiKeyConfigured ?? res.data.configured),
          agentIdConfigured: Boolean(res.data.agentIdConfigured ?? res.data.configured),
        }));
      })
      .catch(err => {
        console.warn('[JAGO Health Check Warning]', err.message);
        setDiagnostics(prev => ({ ...prev, backendReachable: false }));
      });
  }, []);

  // Web Speech API fallback setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          sendTextMessage(transcript);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('[Web Speech Recognition Error]', e.error);
        if (jagoState === 'listening') setJagoState('idle');
      };

      recognition.onend = () => {
        if (jagoState === 'listening') setJagoState('idle');
      };

      recognitionRef.current = recognition;
    }
  }, [language, jagoState]);

  // Stop audio playback & speech synthesis
  const stopAudioPlayback = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Stop session
  const stopJago = useCallback(() => {
    stopAudioPlayback();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    if (conversation.status === 'connected') {
      try { conversation.endSession(); } catch (e) {}
    }
    setJagoState('idle');
    setStatusMessage('Tap Microphone to Speak');
    isStartingRef.current = false;
  }, [stopAudioPlayback, conversation]);

  // Safe Start Session with Exponential Backoff
  const startJago = useCallback(async () => {
    if (isStartingRef.current || jagoState === 'connecting' || jagoState === 'connected') {
      return;
    }

    isStartingRef.current = true;
    stopAudioPlayback();
    setJagoState('connecting');
    setStatusMessage('Connecting...');

    // 1. Check microphone support
    if (!navigator.mediaDevices?.getUserMedia) {
      setJagoState('error');
      setStatusMessage('Microphone not supported on this browser');
      setDiagnostics(prev => ({ ...prev, micPermission: 'DENIED', lastError: 'getUserMedia unsupported' }));
      isStartingRef.current = false;
      return;
    }

    // 2. Request mic permission
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setDiagnostics(prev => ({ ...prev, micPermission: 'GRANTED' }));
    } catch (micErr: any) {
      console.error('[JAGO Mic Permission Error]', micErr);
      setDiagnostics(prev => ({
        ...prev,
        micPermission: 'DENIED',
        lastError: micErr.name || 'Microphone permission denied',
      }));
      setJagoState('error');
      setStatusMessage('Microphone permission required');
      
      let errorDesc = 'Microphone permission is required for voice JAGO. Please allow microphone access and try again.';
      if (micErr.name === 'NotFoundError' || micErr.name === 'DevicesNotFoundError') {
        errorDesc = 'No microphone device was found. Please connect a microphone and try again.';
      } else if (micErr.name === 'NotReadableError' || micErr.name === 'TrackStartError') {
        errorDesc = 'Microphone is currently in use by another application.';
      }

      setChatHistory(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'jago',
          displayText: errorDesc,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      isStartingRef.current = false;
      return;
    }

    // 3. Attempt ElevenLabs Signed URL Session with exponential backoff retry (1s, 2s, 4s)
    const maxAttempts = 4;
    const delays = [0, 1000, 2000, 4000];

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (attempt > 1) {
        setJagoState('reconnecting');
        setStatusMessage(`Reconnecting... (Attempt ${attempt}/${maxAttempts})`);
        await new Promise(r => setTimeout(r, delays[attempt - 1]));
      }

      try {
        const res = await axios.get('/api/jago/signed-url');
        if (res.data?.signedUrl) {
          setDiagnostics(prev => ({ ...prev, signedUrlGenerated: true }));
          await conversation.startSession({ signedUrl: res.data.signedUrl });
          setJagoState('listening');
          setStatusMessage('Listening...');
          isStartingRef.current = false;
          return;
        }
      } catch (err: any) {
        console.warn(`[JAGO ElevenLabs Attempt ${attempt} Failed]`, err.message);
      }
    }

    // 4. Fallback Mode if ElevenLabs Signed URL fails
    console.log('[JAGO Fallback] ElevenLabs real-time agent unavailable. Operating in high-performance local speech mode.');
    setJagoState('listening');
    setStatusMessage('Listening... Speak now');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = getSpeechLangCode(language);
        recognitionRef.current.start();
      } catch (e) {}
    }

    isStartingRef.current = false;
  }, [jagoState, stopAudioPlayback, conversation, language, getSpeechLangCode]);

  // Handle Mic Toggle Button
  const handleMicClick = useCallback(() => {
    if (jagoState === 'listening' || jagoState === 'agent_speaking' || jagoState === 'user_speaking') {
      stopJago();
    } else {
      startJago();
    }
  }, [jagoState, stopJago, startJago]);

  // Send Text / Quick Action Message
  const sendTextMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsgId = `usr_${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      displayText: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatHistory(prev => [...prev, userMsg]);
    setJagoState('processing');
    setStatusMessage('Thinking...');

    // 1. If ElevenLabs Realtime Conversation is connected, send via SDK
    if (conversation.status === 'connected') {
      try {
        await conversation.sendUserMessage(trimmed);
        return;
      } catch (err: any) {
        console.warn('[JAGO sendUserMessage SDK Error]', err);
      }
    }

    // 2. Otherwise send to backend process endpoint
    stopAudioPlayback();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        '/api/voice/process',
        {
          message: trimmed,
          language,
          speed: speechSpeed,
        },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );

      const data = res.data;
      const jagoMsgId = `jago_${Date.now()}`;
      const jagoMsg: ChatMessage = {
        id: jagoMsgId,
        sender: 'jago',
        displayText: data.displayText || data.response || 'I am ready to assist you with your scholarship queries.',
        spokenText: data.spokenText || data.response,
        quickActions: data.quickActions,
        audioBase64: data.audioBase64,
        studentContextUsed: data.studentContextUsed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatHistory(prev => [...prev, jagoMsg]);

      // Play audio response if available
      if (data.audioBase64) {
        setJagoState('agent_speaking');
        setStatusMessage('JAGO is speaking...');
        const audio = new Audio(data.audioBase64);
        currentAudioRef.current = audio;
        audio.play().catch(() => {});
        audio.onended = () => {
          setJagoState('idle');
          setStatusMessage('Tap Microphone to Speak');
        };
      } else if ('speechSynthesis' in window) {
        setJagoState('agent_speaking');
        setStatusMessage('JAGO is speaking...');
        const utterance = new SpeechSynthesisUtterance(data.spokenText || data.displayText);
        utterance.lang = getSpeechLangCode(language);
        utterance.rate = speechSpeed === 'slow' ? 0.85 : 1.0;
        utterance.onend = () => {
          setJagoState('idle');
          setStatusMessage('Tap Microphone to Speak');
        };
        window.speechSynthesis.speak(utterance);
      } else {
        setJagoState('idle');
        setStatusMessage('Tap Microphone to Speak');
      }
    } catch (err) {
      console.error('[JAGO Process Error]', err);
      setJagoState('error');
      setStatusMessage('Connection failed — Tap to retry');
      setChatHistory(prev => [
        ...prev,
        {
          id: `err_msg_${Date.now()}`,
          sender: 'jago',
          displayText: 'JAGO could not process that message. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [conversation, language, speechSpeed, stopAudioPlayback, getSpeechLangCode]);

  const clearHistory = useCallback(() => {
    setChatHistory([]);
  }, []);

  return (
    <JagoContext.Provider
      value={{
        jagoState,
        statusMessage,
        chatHistory,
        isOpen,
        setIsOpen,
        speechSpeed,
        setSpeechSpeed,
        diagnostics,
        startJago,
        stopJago,
        handleMicClick,
        sendTextMessage,
        clearHistory,
      }}
    >
      {children}
    </JagoContext.Provider>
  );
};

export const JagoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ConversationProvider>
      <JagoInnerProvider>{children}</JagoInnerProvider>
    </ConversationProvider>
  );
};

export const useJago = () => {
  const context = useContext(JagoContext);
  if (!context) {
    throw new Error('useJago must be used within a JagoProvider');
  }
  return context;
};
