
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Home, Trophy, Wallet, User, Bell, BarChart2 } from 'lucide-react';
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
    { icon: <User size={22} />, label: 'Profile', path: '/settings' },
  ];

  return (
    <div className="h-[100dvh] w-full bg-[#050505] selection:bg-brand-500 selection:text-white font-sans text-gray-100 flex flex-col md:flex-row overflow-hidden fixed inset-0">
      {/* Background Glows */}
      <div className="fixed top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-brand-900/40 to-transparent pointer-events-none z-0"></div>
      <div className="fixed top-[-100px] right-[-100px] w-64 h-64 bg-brand-500/10 rounded-full blur-[80px] pointer-events-none z-0"></div>
      
      {/* --- DESKTOP SIDEBAR (Tablet & PC) --- */}
      <aside className="hidden md:flex flex-col w-64 h-full fixed left-0 top-0 border-r border-white/5 bg-[#0a0a0c]/95 backdrop-blur-xl z-[60] px-4 py-6 shadow-2xl">
         {/* Logo */}
         <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer group" onClick={() => navigate('/dashboard')}>
           <div className="w-10 h-10 relative">
             <div className="absolute inset-0 bg-brand-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
             <div className="relative w-full h-full bg-gradient-to-br from-[#121214] to-black rounded-lg border border-white/10 flex items-center justify-center">
                <span className="font-display font-bold text-brand-500 text-xl group-hover:scale-110 transition-transform">RK</span>
             </div>
           </div>
           <div>
             <h1 className="text-xl font-display font-bold text-white tracking-widest leading-none">RK ESPORTS</h1>
             <p className="text-[10px] text-gray-500 font-medium tracking-[0.2em] mt-0.5">PLATFORM</p>
           </div>
         </div>

         {/* Navigation */}
         <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
            {navItems.map((item) => {
               const isActive = location.pathname === item.path;
               return (
                 <button
                   key={item.path}
                   onClick={() => navigate(item.path)}
                   className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${
                     isActive 
                     ? 'bg-gradient-to-r from-brand-900 to-brand-800 text-brand-500 border border-brand-500/20 shadow-lg' 
                     : 'text-gray-400 hover:bg-white/5 hover:text-white'
                   }`}
                 >
                    <span className={`${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>{item.icon}</span>
                    <span className="font-bold text-sm tracking-wide">{item.label}</span>
                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500 shadow-[0_0_8px_#ff2e4d]"></div>}
                 </button>
               )
            })}
         </nav>

         {/* Desktop User Profile */}
         <div className="mt-auto pt-4 border-t border-white/5">
             <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3 mb-3 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => navigate('/settings')}>
                 <div className="w-10 h-10 rounded-full bg-brand-900 border border-white/10 overflow-hidden shrink-0">
                    {userProfile?.photoURL ? <img src={userProfile.photoURL} className="w-full h-full object-cover" alt="Profile" /> : <User className="w-full h-full p-2 text-gray-500"/>}
                 </div>
                 <div className="overflow-hidden">
                     <p className="text-sm font-bold text-white truncate">{userProfile?.name || 'User'}</p>
                     <p className="text-xs text-brand-gold font-mono">₹{userProfile?.coins || 0}</p>
                 </div>
             </div>
         </div>
      </aside>

      {/* --- MOBILE TOP BAR --- */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 pt-safe-top glass-nav z-[60] px-4 flex items-center justify-between border-b border-white/5 bg-[#050505]/95 backdrop-blur-xl transition-all duration-200">
        <div className="flex items-center gap-3" onClick={() => navigate('/dashboard')}>
           <div className="w-9 h-9 relative group cursor-pointer">
             <div className="absolute inset-0 bg-brand-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
             <div className="relative w-full h-full bg-gradient-to-br from-[#121214] to-black rounded-lg border border-white/10 flex items-center justify-center">
                <span className="font-display font-bold text-brand-500 text-lg">RK</span>
             </div>
           </div>
           <div>
             <h1 className="text-lg font-display font-bold text-white tracking-widest leading-none">RK ESPORTS</h1>
             <p className="text-[9px] text-gray-500 font-medium tracking-[0.2em] mt-0.5">TOURNAMENT PLATFORM</p>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-[#0a0a0c]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-yellow-500/20 flex items-center gap-2 shadow-[0_0_15px_rgba(255,215,0,0.05)] hover:border-yellow-500/40 transition-colors cursor-pointer active:scale-95" onClick={() => navigate('/wallet')}>
            <span className="w-2 h-2 bg-brand-gold rounded-full animate-pulse shadow-[0_0_10px_#ffd700]"></span>
            <span className="text-sm font-bold text-brand-gold font-mono">{userProfile?.coins || 0}</span>
          </div>
          <button 
            onClick={() => navigate('/notifications')}
            className="relative p-2 text-gray-400 hover:text-white transition-colors hover:bg-white/5 rounded-full active:bg-white/10"
          >
            <Bell size={22} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-brand-500 rounded-full border-2 border-black"></span>
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      {/* 
         GLOBAL FIX: 
         1. h-full ensures it takes the remaining height inside the flex container.
         2. pt-20 (5rem) ensures top bar clearance.
         3. pb-32 (8rem) guarantees bottom clearance for Navbar + FABs + Safe Area.
      */}
      <main className="flex-1 w-full relative z-10 overflow-y-auto overflow-x-hidden scroll-smooth pt-20 pb-32 md:pt-8 md:pb-8 md:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
        </div>
      </main>

      {/* AI Assistant - Positioned above bottom nav */}
      <AIAssistant />

      {/* --- MOBILE BOTTOM NAV --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass-nav z-[70] flex items-center justify-around px-2 border-t border-white/5 shadow-[0_-5px_20px_rgba(0,0,0,0.8)] bg-[#050505] pb-[env(safe-area-inset-bottom)] h-[calc(4rem+env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button 
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center justify-center w-full h-full transition-all duration-200 group py-1 active:scale-90 touch-manipulation ${
                isActive ? 'text-brand-500' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="nav-glow"
                  className="absolute inset-0 bg-brand-500/10 blur-xl rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110 -translate-y-1' : 'group-hover:scale-105'}`}>
                {item.icon}
              </div>
              {isActive && (
                <motion.span 
                  layoutId="nav-dot"
                  className="absolute bottom-2 w-1 h-1 bg-brand-500 rounded-full shadow-[0_0_8px_#ff2e4d]"
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  );
};
