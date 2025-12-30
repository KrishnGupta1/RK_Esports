import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Home, Trophy, Wallet, User, Bell, BarChart2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: <Home size={20} />, label: 'Home', path: '/dashboard' },
    { icon: <Trophy size={20} />, label: 'Play', path: '/tournaments' },
    { icon: <BarChart2 size={20} />, label: 'Rank', path: '/leaderboard' },
    { icon: <Wallet size={20} />, label: 'Wallet', path: '/wallet' },
    { icon: <User size={20} />, label: 'Profile', path: '/support' }, // Reusing support as generic profile/more for now
  ];

  return (
    <div className="min-h-screen bg-brand-900 pb-20">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-brand-800 border-b border-gray-700 flex items-center justify-between px-4 z-50 shadow-lg">
        <div className="flex items-center gap-2" onClick={() => navigate('/dashboard')}>
           {/* Logo Placeholder */}
           <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center font-bold text-white shadow-lg shadow-brand-500/30">
             RK
           </div>
           <h1 className="text-lg font-bold text-white tracking-wider">RK ESPORTS</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-brand-900 px-3 py-1 rounded-full border border-gray-700 flex items-center gap-2">
            <span className="w-4 h-4 bg-brand-gold rounded-full block shadow-[0_0_10px_#ffa502]"></span>
            <span className="text-sm font-bold text-brand-gold">{userProfile?.coins || 0}</span>
          </div>
          <button 
            onClick={() => navigate('/notifications')}
            className="relative p-2 text-gray-400 hover:text-white transition-colors"
          >
            <Bell size={22} />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-brand-800"></span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-20 px-4">
        {children}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-brand-800 border-t border-gray-700 flex items-center justify-around z-50 safe-area-bottom">
        {navItems.map((item) => (
          <button 
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 relative ${
              location.pathname === item.path ? 'text-brand-500' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {location.pathname === item.path && (
              <span className="absolute -top-px left-1/2 -translate-x-1/2 w-12 h-1 bg-brand-500 rounded-b-full shadow-[0_0_10px_rgba(255,71,87,0.8)]"></span>
            )}
            {item.icon}
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};