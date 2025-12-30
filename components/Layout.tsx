import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Home, Trophy, Wallet, User, Bell, BarChart2, Menu } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AIAssistant } from './AIAssistant';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: <Home size={22} />, label: 'Home', path: '/dashboard' },
    { icon: <Trophy size={22} />, label: 'Play', path: '/tournaments' },
    { icon: <BarChart2 size={22} />, label: 'Rank', path: '/leaderboard' },
    { icon: <Wallet size={22} />, label: 'Wallet', path: '/wallet' },
    { icon: <User size={22} />, label: 'Profile', path: '/support' },
  ];

  return (
    <div className="min-h-screen bg-brand-950 pb-24 selection:bg-brand-500 selection:text-white">
      {/* Background Glows */}
      <div className="fixed top-0 left-0 w-full h-[50vh] bg-hero-glow opacity-30 pointer-events-none z-0"></div>
      
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 glass-nav z-50 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3" onClick={() => navigate('/dashboard')}>
           {/* Animated Logo */}
           <div className="w-9 h-9 relative group cursor-pointer">
             <div className="absolute inset-0 bg-brand-500 rounded-lg blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
             <div className="relative w-full h-full bg-gradient-to-br from-brand-900 to-black rounded-lg border border-brand-500/30 flex items-center justify-center">
                <span className="font-display font-bold text-brand-500 text-lg">RK</span>
             </div>
           </div>
           <div>
             <h1 className="text-lg font-display font-bold text-white tracking-widest leading-none">RK ESPORTS</h1>
             <p className="text-[10px] text-gray-500 font-medium tracking-wide">TOURNAMENT PLATFORM</p>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-[#0a0a0c]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-yellow-500/20 flex items-center gap-2 shadow-[0_0_15px_rgba(255,215,0,0.05)]">
            <span className="w-2 h-2 bg-brand-gold rounded-full animate-pulse shadow-[0_0_10px_#ffd700]"></span>
            <span className="text-sm font-bold text-brand-gold font-mono">{userProfile?.coins || 0}</span>
          </div>
          <button 
            onClick={() => navigate('/notifications')}
            className="relative p-2 text-gray-400 hover:text-white transition-colors"
          >
            <Bell size={22} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-brand-500 rounded-full border-2 border-black"></span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-20 px-4 relative z-10 animate-fade-in">
        {children}
      </main>

      {/* AI Assistant */}
      <AIAssistant />

      {/* Bottom Navigation */}
      <div className="fixed bottom-4 left-4 right-4 h-16 glass-nav rounded-2xl z-50 shadow-2xl flex items-center justify-around px-2 border border-white/5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button 
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${
                isActive ? 'text-brand-500 scale-110' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="nav-glow"
                  className="absolute inset-0 bg-brand-500/10 blur-xl rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className="relative z-10">
                {item.icon}
              </div>
              {isActive && (
                <motion.span 
                  layoutId="nav-dot"
                  className="absolute -bottom-2 w-1 h-1 bg-brand-500 rounded-full shadow-[0_0_8px_#ff2e4d]"
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  );
};