import React from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { Card, Badge, Button } from '../components/UI';
import { useNavigate } from 'react-router-dom';
import { User, Copy, Swords, ChevronRight } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const copyUid = () => {
    if (userProfile?.ffUid) {
      navigator.clipboard.writeText(userProfile.ffUid);
      alert("UID Copied!");
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* User Stats Card */}
        <Card className="bg-gradient-to-br from-brand-800 to-gray-900 border-gray-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-brand-500 flex items-center justify-center overflow-hidden border-2 border-brand-400 shadow-lg">
              {userProfile?.photoURL ? (
                <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white truncate">{userProfile?.ffName || userProfile?.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded">
                  UID: {userProfile?.ffUid || 'N/A'}
                </span>
                <button onClick={copyUid} className="text-brand-500 hover:text-white transition-colors">
                  <Copy size={14} />
                </button>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <Badge color={userProfile?.status === 'active' ? 'green' : 'red'}>
                {userProfile?.status.toUpperCase()}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-700">
            <div className="text-center">
              <p className="text-gray-400 text-xs uppercase tracking-wide">Matches</p>
              <p className="text-xl font-bold text-white">0</p>
            </div>
            <div className="text-center border-l border-gray-700">
              <p className="text-gray-400 text-xs uppercase tracking-wide">Kills</p>
              <p className="text-xl font-bold text-white">0</p>
            </div>
            <div className="text-center border-l border-gray-700">
              <p className="text-gray-400 text-xs uppercase tracking-wide">Wins</p>
              <p className="text-xl font-bold text-white">0</p>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
           <button onClick={() => navigate('/tournaments')} className="bg-brand-500 hover:bg-brand-400 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all shadow-lg shadow-brand-500/20">
             <Swords size={32} className="text-white" />
             <span className="font-bold text-white">Join Match</span>
           </button>
           <button onClick={() => navigate('/wallet')} className="bg-brand-800 hover:bg-brand-700 border border-gray-700 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all">
             <span className="text-2xl font-bold text-brand-gold">₹ {userProfile?.coins}</span>
             <span className="text-xs text-gray-400 font-medium">Wallet Balance</span>
           </button>
        </div>

        {/* Featured Tournament Banner */}
        <div className="relative rounded-xl overflow-hidden h-40 group cursor-pointer" onClick={() => navigate('/tournaments')}>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent z-10"></div>
          <img 
            src="https://picsum.photos/800/400" 
            alt="Tournament" 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          <div className="absolute bottom-4 left-4 z-20">
            <Badge color="red">LIVE NOW</Badge>
            <h3 className="text-xl font-bold text-white mt-1">Daily Scrims #42</h3>
            <p className="text-gray-300 text-xs">Squad • Bermuda • Entry: 50</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
             <h3 className="text-lg font-bold text-white">Recent Matches</h3>
             <button className="text-xs text-brand-500 flex items-center">View All <ChevronRight size={12} /></button>
          </div>
          <div className="text-center py-8 bg-brand-800/50 rounded-xl border border-gray-800 border-dashed">
            <p className="text-gray-500 text-sm">No recent matches found.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;