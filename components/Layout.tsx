import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Home, Trophy, Wallet, LifeBuoy, LogOut, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: <Home size={20} />, label: 'Home', path: '/dashboard' },
    { icon: <Trophy size={20} />, label: 'Play', path: '/tournaments' },
    { icon: <Wallet size={20} />, label: 'Wallet', path: '/wallet' },
    { icon: <LifeBuoy size={20} />, label: 'Help', path: '/support' },
  ];

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await logout();
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-brand-900 pb-20">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-brand-800 border-b border-gray-700 flex items-center justify-between px-4 z-50 shadow-lg">
        <div className="flex items-center gap-2">
           {/* Logo Placeholder */}
           <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center font-bold text-white">
             RK
           </div>
           <h1 className="text-lg font-bold text-white tracking-wider">RK ESPORTS</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-brand-900 px-3 py-1 rounded-full border border-gray-700 flex items-center gap-2">
            <span className="w-4 h-4 bg-brand-gold rounded-full block shadow-[0_0_10px_#ffa502]"></span>
            <span className="text-sm font-bold text-brand-gold">{userProfile?.coins || 0}</span>
          </div>
          <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-white">
            <LogOut size={20} />
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
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              location.pathname === item.path ? 'text-brand-500' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {item.icon}
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};