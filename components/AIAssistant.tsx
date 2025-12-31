import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, Loader2, Minimize2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxbcjU71sjaELrdnjX_yIHlYDPJNbnOPo9telCTUDuiC8J4B8GWRzJDErYnKGMC1J3_bw/exec";

export const AIAssistant: React.FC = () => {
  const { userProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: `Hello ${userProfile?.name?.split(' ')[0] || 'Gamer'}! I'm your RK Esports assistant. How can I help you today?`,
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Update welcome message if user logs in
  useEffect(() => {
    if (userProfile?.name && messages.length === 1 && messages[0].id === 'welcome') {
      setMessages([{
        id: 'welcome',
        text: `Hello ${userProfile.name.split(' ')[0]}! I'm your RK Esports assistant. How can I help you today?`,
        sender: 'bot',
        timestamp: new Date()
      }]);
    }
  }, [userProfile]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      // API Call to Google Apps Script Web App
      // We send UID and Role to give context to the AI
      const payload = {
        message: userMsg.text,
        uid: userProfile?.uid || 'guest',
        role: userProfile?.role || 'user',
        name: userProfile?.name || 'Guest',
        context: {
          coins: userProfile?.coins,
          ffUid: userProfile?.ffUid
        }
      };

      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8", // text/plain avoids CORS preflight issues with GAS
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const botText = data.response || data.text || data.reply || "I received your message.";

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: botText,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      console.error("AI Error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting to the server. Please try again later.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!userProfile) return null; // Only show for logged in users

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-4 z-40 w-12 h-12 bg-brand-500 rounded-full shadow-[0_0_15px_rgba(255,46,77,0.5)] flex items-center justify-center text-white border border-white/20 hover:bg-brand-400 transition-colors"
          >
            <Bot size={24} />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Compact Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-4 z-50 w-[85vw] max-w-[300px] h-[400px] max-h-[50vh] bg-brand-900 border border-brand-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
          >
            {/* Header */}
            <div className="bg-brand-800 px-3 py-2.5 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-500/20 rounded-full flex items-center justify-center border border-brand-500/50 relative overflow-hidden">
                   <div className="absolute inset-0 bg-brand-500/20 animate-pulse"></div>
                   <Bot size={16} className="text-brand-500 relative z-10" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-sm tracking-wide">RK_Assistant</h3>
                  <p className="text-[9px] text-green-500 flex items-center gap-1 font-mono leading-none mt-0.5">
                    <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></span>
                    ONLINE
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <Minimize2 size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-black/40 scrollbar-hide">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-2.5 rounded-2xl text-xs leading-relaxed shadow-lg ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-tr-none'
                        : 'bg-brand-800 text-gray-200 border border-white/10 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-brand-800 p-3 rounded-2xl rounded-tl-none border border-white/10 flex gap-1 shadow-lg">
                    <motion.span 
                      animate={{ y: [0, -3, 0] }} 
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      className="w-1 h-1 bg-brand-500 rounded-full"
                    ></motion.span>
                    <motion.span 
                      animate={{ y: [0, -3, 0] }} 
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      className="w-1 h-1 bg-brand-500 rounded-full"
                    ></motion.span>
                    <motion.span 
                      animate={{ y: [0, -3, 0] }} 
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      className="w-1 h-1 bg-brand-500 rounded-full"
                    ></motion.span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-2 bg-brand-800 border-t border-white/10 shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 bg-brand-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !inputValue.trim()}
                  className="bg-brand-500 text-white w-8 h-8 rounded-lg flex items-center justify-center hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-500/20"
                >
                  {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};