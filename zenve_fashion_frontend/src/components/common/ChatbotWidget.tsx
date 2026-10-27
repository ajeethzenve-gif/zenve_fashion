import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, X, Send, ChevronDown, RefreshCw, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../services/api';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  isError?: boolean;
}

interface HistoryEntry {
  role: 'user' | 'assistant';
  content: string;
}

function formatTimestamp(): string {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date());
}

const TypingIndicator: React.FC = () => (
  <div className="flex items-start">
    <div className="max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-3 bg-[#003524]/80 border border-[#E4BD5A]/20 shadow-[0_2px_10px_rgba(0,0,0,0.2)] flex items-center space-x-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#E4BD5A]/70"
          style={{ animation: `zenve-bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </div>
  </div>
);

const QUICK_SUGGESTIONS = [
  'Twin Collection',
  'Size & Fitting',
  'Colour Advice',
  'Occasion Styling',
  'Order & Delivery',
  'Pet Outfits',
];

function extractPageUrl(text: string): { path: string; label: string } | null {
  const match = text.match(/(\/(?:twin|people|pets|shop|collections|cart|wishlist|account\/orders|contact|shipping|refund)[a-zA-Z0-9_\-\/?=]*)/i);
  if (!match) return null;
  const path = match[1];
  let label = 'View Products';
  if (path.startsWith('/twin')) label = 'View Twin Collection';
  else if (path.startsWith('/people')) label = 'View People Collection';
  else if (path.startsWith('/pets')) label = 'View Pets Collection';
  else if (path.startsWith('/shop') || path.startsWith('/collections')) label = 'Explore Shop';
  else if (path.startsWith('/cart')) label = 'View Shopping Bag';
  else if (path.startsWith('/wishlist')) label = 'View Wishlist';
  else if (path.startsWith('/account/orders')) label = 'View My Orders';
  else if (path.startsWith('/contact')) label = 'Contact Concierge';
  else if (path.startsWith('/shipping')) label = 'Shipping Details';
  else if (path.startsWith('/refund')) label = 'Return Policy';
  return { path, label };
}

export const ChatbotWidget: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: 'Greetings and welcome to Zenve Atelier. I am your personal couture stylist and fashion concierge — here to guide you through our handcrafted collections.',
      timestamp: formatTimestamp(),
    },
    {
      id: 'welcome-2',
      sender: 'bot',
      text: 'Whether you seek styling advice, fabric guidance, sizing help, or wish to explore our signature twin collections — I am at your service.',
      timestamp: formatTimestamp(),
    },
  ]);

  const conversationHistory = useRef<HistoryEntry[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (isOpen && !isTyping) {
      const timer = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isTyping]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: formatTimestamp(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    const historySnapshot = conversationHistory.current.slice(-10);
    conversationHistory.current = [...historySnapshot, { role: 'user', content: trimmed }];

    try {
      const response = await apiClient.post('/chatbot/chat/', {
        message: trimmed,
        history: historySnapshot,
      });

      const replyText: string =
        response.data?.reply ||
        'Thank you for your message. Our styling team will be in touch with personalised guidance shortly.';

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: replyText,
          timestamp: formatTimestamp(),
        },
      ]);

      conversationHistory.current = [
        ...conversationHistory.current,
        { role: 'assistant', content: replyText },
      ].slice(-10);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'bot',
          text: 'My sincerest apologies — our concierge is experiencing a brief moment of quietude. Please try again shortly.',
          timestamp: formatTimestamp(),
          isError: true,
        },
      ]);
    } finally {
      setIsTyping(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isTyping]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    sendMessage(inputValue);
  };

  const handleSuggestionClick = (text: string) => sendMessage(text);

  const handleClearChat = () => {
    conversationHistory.current = [];
    setMessages([{
      id: `welcome-reset-${Date.now()}`,
      sender: 'bot',
      text: 'Our conversation has been refreshed. How may I assist you today?',
      timestamp: formatTimestamp(),
    }]);
  };

  return (
    <>
      <style>{`
        @keyframes zenve-bounce {
          0%,60%,100%{transform:translateY(0);opacity:0.5}
          30%{transform:translateY(-5px);opacity:1}
        }
        @keyframes zenve-slide-up {
          from{opacity:0;transform:translateY(20px) scale(0.97)}
          to{opacity:1;transform:translateY(0) scale(1)}
        }
        @keyframes zenve-fade-in {
          from{opacity:0;transform:translateX(8px)}
          to{opacity:1;transform:translateX(0)}
        }
        .zenve-chat-window{animation:zenve-slide-up 0.3s cubic-bezier(0.16,1,0.3,1) both}
        .zenve-teaser{animation:zenve-fade-in 0.4s ease both}
        .zenve-msg-appear{animation:zenve-fade-in 0.25s ease both}
      `}</style>

      <aside aria-label="Zenve Atelier Concierge" className="fixed bottom-6 right-6 z-50 flex flex-col items-end select-none">
        {isOpen && (
          <section
            id="zenve-chat-window"
            role="region"
            aria-label="Atelier Concierge Chat Window"
            aria-live="polite"
            className="zenve-chat-window mb-4 w-[92vw] max-w-[370px] sm:w-[390px] h-[550px] max-h-[82vh] flex flex-col rounded-2xl bg-gradient-to-b from-[#002B1D] via-[#001F15] to-[#00140D] border border-[#E4BD5A]/35 shadow-[0_15px_45px_rgba(0,0,0,0.7),0_0_30px_rgba(228,189,90,0.15)] backdrop-blur-xl overflow-hidden"
          >
            {/* HEADER */}
            <div className="relative p-4 sm:p-5 border-b border-[#E4BD5A]/25 bg-gradient-to-r from-[#073B2A] to-[#002217] flex items-center justify-between flex-shrink-0">
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#E4BD5A]/50" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#E4BD5A]/50" />

              <div className="flex items-center space-x-3">
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E4BD5A] via-[#F1D27A] to-[#C99E3A] p-[1.5px] shadow-[0_0_15px_rgba(228,189,90,0.35)]">
                    <div className="w-full h-full rounded-full bg-[#002B1D] flex items-center justify-center p-1.5 overflow-hidden">
                      <img src="/logo/zenve-logo.png" alt="Zenve Fashion Crest" className="w-full h-full object-contain drop-shadow-[0_1px_4px_rgba(228,189,90,0.4)]" />
                    </div>
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#002B1D]" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <h3 className="font-serif text-sm tracking-[0.2em] text-[#F5F0DF] font-semibold uppercase">ZENVE CONCIERGE</h3>
                    <Sparkles className="w-3.5 h-3.5 text-[#E4BD5A] animate-pulse" />
                  </div>
                  <p className="text-[11px] text-[#B8B9A8] tracking-wide flex items-center space-x-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Personal Couture Stylist • Online</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button type="button" onClick={handleClearChat} className="p-1.5 rounded-full text-[#B8B9A8] hover:text-[#E4BD5A] hover:bg-[#E4BD5A]/10 transition-colors" aria-label="New conversation" title="New conversation">
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => setIsOpen(false)} className="p-1.5 rounded-full text-[#B8B9A8] hover:text-[#E4BD5A] hover:bg-[#E4BD5A]/10 transition-colors" aria-label="Close concierge window">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E4BD5A22 transparent' }}>
              {messages.map((msg) => {
                const isBot = msg.sender === 'bot';
                const page = isBot ? extractPageUrl(msg.text) : null;
                return (
                  <div key={msg.id} className={`zenve-msg-appear flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
                    <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 leading-relaxed whitespace-pre-line ${
                      isBot
                        ? msg.isError
                          ? 'bg-red-950/60 text-[#F5F0DF] border border-red-800/40 rounded-tl-sm'
                          : 'bg-[#003524]/80 text-[#F5F0DF] border border-[#E4BD5A]/20 rounded-tl-sm shadow-[0_2px_10px_rgba(0,0,0,0.2)]'
                        : 'bg-gradient-to-r from-[#E4BD5A] to-[#D5A943] text-[#001C13] font-medium rounded-tr-sm shadow-[0_2px_12px_rgba(228,189,90,0.25)]'
                    }`}>
                      <div>{msg.text}</div>
                      {page && (
                        <button
                          type="button"
                          onClick={() => navigate(page.path)}
                          className="mt-2.5 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#E4BD5A] via-[#F1D27A] to-[#C99E3A] text-[#001C13] font-semibold text-[11px] shadow-[0_2px_8px_rgba(228,189,90,0.3)] hover:brightness-110 active:scale-95 transition-all"
                        >
                          <span>{page.label}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <span className="text-[9px] text-[#B8B9A8]/60 mt-1 px-1">{msg.timestamp}</span>
                  </div>
                );
              })}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* SUGGESTIONS */}
            <div className="px-4 py-2 border-t border-[#E4BD5A]/15 bg-[#001C13]/60 flex-shrink-0">
              <p className="text-[10px] text-[#B8B9A8] mb-1.5 tracking-wider uppercase">Quick Suggestions:</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_SUGGESTIONS.map((pill) => (
                  <button
                    key={pill}
                    type="button"
                    disabled={isTyping}
                    onClick={() => handleSuggestionClick(pill)}
                    className="px-2.5 py-1 text-[10px] rounded-full bg-[#002B1D] border border-[#E4BD5A]/30 text-[#E4BD5A] hover:bg-[#E4BD5A]/15 hover:border-[#E4BD5A] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    {pill}
                  </button>
                ))}
              </div>
            </div>

            {/* INPUT */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-[#E4BD5A]/20 bg-[#001C13] flex items-center space-x-2 flex-shrink-0">
              <input
                ref={inputRef}
                type="text"
                id="zenve-chatbot-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isTyping ? 'Zenve is crafting a response...' : 'Ask for styling advice, sizing...'}
                className="flex-1 bg-[#002B1D] text-[#F5F0DF] text-xs placeholder-[#B8B9A8]/50 px-3.5 py-2.5 rounded-xl border border-[#E4BD5A]/25 focus:outline-none focus:border-[#E4BD5A] focus:ring-1 focus:ring-[#E4BD5A] transition-all"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#E4BD5A] to-[#D5A943] text-[#001C13] flex items-center justify-center hover:opacity-95 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_12px_rgba(228,189,90,0.25)]"
                aria-label="Send message to concierge"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </section>
        )}

        {/* TRIGGER BUTTON */}
        <div className="flex items-center space-x-3">
          {!isOpen && (!hasInteracted || isHovered) && (
            <div
              role="button"
              tabIndex={0}
              onClick={() => { setIsOpen(true); setHasInteracted(true); }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setIsOpen(true); setHasInteracted(true); } }}
              className="zenve-teaser cursor-pointer hidden sm:flex items-center space-x-2 px-3.5 py-2 rounded-full bg-[#001F15]/95 border border-[#E4BD5A]/40 text-[#F5F0DF] text-xs font-medium shadow-[0_4px_20px_rgba(0,0,0,0.5),0_0_15px_rgba(228,189,90,0.15)] backdrop-blur-md hover:border-[#E4BD5A] hover:text-[#E4BD5A] transition-all duration-300"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E4BD5A] animate-pulse" />
              <span className="font-serif tracking-widest text-[11px] uppercase">Atelier Concierge</span>
            </div>
          )}

          <button
            type="button"
            id="zenve-chatbot-trigger"
            onClick={() => { setIsOpen((prev) => !prev); setHasInteracted(true); }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative group w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#0A4733] via-[#002B1D] to-[#00150D] border-2 border-[#E4BD5A]/70 hover:border-[#E4BD5A] text-[#E4BD5A] flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.6),0_0_25px_rgba(228,189,90,0.35)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.7),0_0_35px_rgba(228,189,90,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#E4BD5A] focus:ring-offset-2 focus:ring-offset-[#002B1D]"
            aria-expanded={isOpen}
            aria-controls="zenve-chat-window"
            aria-label={isOpen ? 'Close Concierge Chat' : 'Open Zenve Atelier Concierge Chatbot'}
          >
            <span className="absolute inset-0 rounded-full border border-[#E4BD5A]/30 animate-ping pointer-events-none opacity-40" />
            <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#001C13] shadow-[0_0_8px_rgba(52,211,153,0.8)] flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </span>
            <div className="relative flex items-center justify-center transition-transform duration-300">
              {isOpen ? (
                <ChevronDown className="w-6 h-6 text-[#E4BD5A] transform transition-transform group-hover:translate-y-0.5" />
              ) : (
                <div className="relative flex items-center justify-center">
                  <img src="/logo/zenve-logo.png" alt="Zenve Fashion" className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-[0_2px_10px_rgba(228,189,90,0.5)] transition-transform duration-300 group-hover:scale-110" />
                  <Sparkles className="w-3.5 h-3.5 text-[#FFF4D0] absolute -top-1.5 -right-1.5 animate-pulse drop-shadow-[0_0_4px_rgba(228,189,90,0.8)]" />
                </div>
              )}
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};

export default ChatbotWidget;
