import React from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { Card, Badge, Button } from '../components/UI';
import { useNavigate } from 'react-router-dom';
import { User, Copy, Swords, ChevronRight, Zap, Trophy, Target } from 'lucide-react';

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
      <div className="space-y-8">
        
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Welcome back,</p>
            <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wide">
              {userProfile?.ffName || userProfile?.name || 'PLAYER'}
            </h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-purple p-[1px]">
             <div className="w-full h-full bg-black rounded-xl overflow-hidden">
                {userProfile?.photoURL ? (
                  <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-brand-900 text-gray-500">
                    <User size={20} />
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* User Stats Card - Gamer Tag Style */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500 to-brand-purple rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
          <Card className="relative bg-[#0f0f11] !p-0 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
            <div className="absolute right-0 top-0 w-32 h-32 bg-brand-500/10 blur-[50px] rounded-full"></div>
            
            <div className="p-5 relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                    <Trophy className="text-brand-gold" size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">FF UID</p>
                    <div className="flex items-center gap-2 cursor-pointer hover:text-brand-500 transition-colors" onClick={copyUid}>
                      <span className="font-mono text-white font-bold">{userProfile?.ffUid || 'NOT SET'}</span>
                      <Copy size={12} />
                    </div>
                  </div>
                </div>
                <Badge color={userProfile?.status === 'active' ? 'green' : 'red'}>
                  {userProfile?.status.toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-3 divide-x divide-white/5 bg-white/5 rounded-xl border border-white/5 backdrop-blur-sm">
                <div className="p-3 text-center">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Matches</p>
                  <p className="text-xl font-display font-bold text-white">0</p>
                </div>
                <div className="p-3 text-center">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Kills</p>
                  <p className="text-xl font-display font-bold text-brand-500">0</p>
                </div>
                <div className="p-3 text-center">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Wins</p>
                  <p className="text-xl font-display font-bold text-brand-gold">0</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
           <button 
             onClick={() => navigate('/tournaments')} 
             className="group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 transition-all duration-300"
           >
             <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-white/30 transition-all"></div>
             <Swords size={28} className="text-white mb-3 relative z-10" />
             <div className="relative z-10 text-left">
                <span className="block font-display font-bold text-lg text-white leading-none mb-1">JOIN MATCH</span>
                <span className="text-[10px] text-brand-100 font-medium tracking-wide">ENTER THE ARENA</span>
             </div>
           </button>

           <button 
             onClick={() => navigate('/wallet')} 
             className="group relative overflow-hidden rounded-2xl p-5 bg-brand-800 border border-white/5 hover:border-brand-gold/50 transition-all duration-300"
           >
             <div className="absolute top-0 right-0 w-20 h-20 bg-brand-gold/10 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
             <div className="mb-3 relative z-10 bg-brand-gold/20 w-fit p-1.5 rounded-lg text-brand-gold">
               <Zap size={20} className="fill-brand-gold" />
             </div>
             <div className="relative z-10 text-left">
                <span className="block font-display font-bold text-lg text-white leading-none mb-1">₹ {userProfile?.coins}</span>
                <span className="text-[10px] text-gray-400 font-medium tracking-wide">WALLET BALANCE</span>
             </div>
           </button>
        </div>

        {/* Featured Tournament Banner */}
        <div className="relative rounded-2xl overflow-hidden h-44 group cursor-pointer border border-white/5 shadow-2xl" onClick={() => navigate('/tournaments')}>
          <div className="absolute inset-0 bg-brand-900">
             <img 
               src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80" 
               alt="Tournament" 
               className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-all duration-700 ease-out" 
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
          </div>
          <div className="absolute bottom-5 left-5 right-5 z-20">
            <div className="flex items-center gap-2 mb-2">
              <Badge color="red">LIVE NOW</Badge>
              <span className="text-[10px] bg-black/50 backdrop-blur px-2 py-0.5 rounded text-gray-300 border border-white/10">SQUAD</span>
            </div>
            <h3 className="text-2xl font-display font-bold text-white mb-1">Grand Battle Royale #01</h3>
            <div className="flex items-center justify-between">
              <p className="text-gray-300 text-xs flex items-center gap-1"><Target size={12}/> Bermuda</p>
              <span className="text-brand-gold font-bold text-sm">Prize: ₹2000</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-4 px-1">
             <h3 className="text-md font-display font-bold text-white tracking-wide">RECENT MATCHES</h3>
             <button className="text-xs text-brand-500 font-bold flex items-center hover:text-brand-400">VIEW ALL <ChevronRight size={12} /></button>
          </div>
          <Card className="flex flex-col items-center justify-center py-12 border-dashed border-2 border-white/5 bg-transparent">
             <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
               <Swords className="text-gray-600" size={20} />
             </div>
            <p className="text-gray-500 text-sm font-medium">No recent matches found.</p>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;