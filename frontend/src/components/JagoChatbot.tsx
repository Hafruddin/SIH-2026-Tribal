import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, X, Send, Bot, User, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'jago';
  text: string;
  quickActions?: string[];
  studentContextUsed?: boolean;
  timestamp: string;
}

export const JagoChatbot: React.FC = () => {
  const { language, t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'jago',
      text: isAuthenticated
        ? `Namaste ${user?.studentProfile?.full_name || 'Scholar'}! I am JAGO, your AI Tribal Scholarship Guide. I can retrieve your live application tracking status, check payment details, or guide you through scheme requirements.`
        : `Namaste! I am JAGO, your AI Tribal Scholarship Guide. Ask me anything about ST scholarships, eligibility rules, document vault reuse, or OTR registration!`,
      quickActions: ['Check Application', 'Check Eligibility', 'Required Documents', 'Payment Status', 'Raise Grievance'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    try {
      const res = await axios.post('/api/chat', {
        message: text,
        language,
      });

      const jagoReply: ChatMessage = {
        sender: 'jago',
        text: res.data.response,
        quickActions: res.data.quickActions,
        studentContextUsed: res.data.studentContextUsed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, jagoReply]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'jago',
          text: 'I apologize, I am temporarily having trouble connecting. Please try asking again or click one of the quick action buttons.',
          quickActions: ['Check Eligibility', 'View Schemes'],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="jago-chat" className="fixed bottom-5 right-5 z-50">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-[#8B4513] to-[#E67E22] text-white p-4 rounded-full shadow-2xl hover:scale-105 transition flex items-center space-x-2 border-2 border-white group"
          aria-label="Open JAGO AI Chatbot Assistant"
        >
          <div className="relative">
            <Bot className="w-6 h-6 animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border border-white"></span>
          </div>
          <span className="font-bold text-sm hidden sm:inline pr-1">Ask JAGO AI</span>
        </button>
      )}

      {/* Chat Window Drawer */}
      {isOpen && (
        <div className="bg-white rounded-xl shadow-2xl border border-gray-300 w-[92vw] sm:w-[400px] h-[550px] max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#8B4513] via-[#5C2E0B] to-[#004466] text-white p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-[#E67E22] flex items-center justify-center text-white shadow-inner font-bold">
                🤖
              </div>
              <div>
                <h3 className="font-bold text-sm flex items-center gap-1.5">
                  JAGO AI Assistant
                  <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.2 rounded-full font-normal">Online</span>
                </h3>
                <p className="text-[11px] text-orange-200">Ministry of Tribal Affairs AI Guide</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
              aria-label="Close Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50 text-xs">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-xl shadow-sm whitespace-pre-line leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#8B4513] text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  }`}
                >
                  {msg.studentContextUsed && (
                    <div className="text-[10px] bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded border border-amber-200 mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#E67E22]" /> Live Authenticated Student Data
                    </div>
                  )}
                  {msg.text}
                </div>

                <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.timestamp}</span>

                {/* Quick Action Chips */}
                {msg.quickActions && msg.quickActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-[90%]">
                    {msg.quickActions.map((action, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleSendMessage(action)}
                        className="bg-amber-100/70 hover:bg-amber-200 text-[#8B4513] border border-amber-300/60 px-2.5 py-1 rounded-full text-[11px] font-medium transition hover:scale-105"
                      >
                        ⚡ {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-gray-500 text-xs py-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#E67E22]" />
                <span>JAGO is retrieving verified records...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-gray-200">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                placeholder="Ask JAGO about status, eligibility, documents..."
                className="flex-1 bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
              />
              <button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className="bg-[#8B4513] hover:bg-[#5C2E0B] text-white p-2 rounded-lg transition disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
