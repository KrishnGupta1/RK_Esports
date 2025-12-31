
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { Card, Badge } from '../components/UI';
import { useNavigate } from 'react-router-dom';
import { User, Copy, Swords, ChevronRight, Zap, Trophy, Flame, Play, Star, ExternalLink, Megaphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard: React.FC = () => {
  const { userProfile, advertisements } = useAuth();
  const navigate = useNavigate();
  const [newsIndex, setNewsIndex] = useState(0);
  const [adIndex, setAdIndex] = useState(0);

  // Filter only active ads
  const activeAds = advertisements.filter(ad => ad.active);

  // --- NEWS ITEMS ---
  const news = [
      { id: 1, text: "Grand Battle Royale #01 starts in 2 hours! Register now.", color: "bg-blue-500" },
      { id: 2, text: "New 'Lone Wolf' mode added. Check it out!", color: "bg-purple-500" },
      { id: 3, text: "Weekend Special: 2x XP on all matches.", color: "bg-brand-500" }
  ];

  useEffect(() => {
      const timer = setInterval(() => setNewsIndex(prev => (prev + 1) % news.length), 4000);
      return () => clearInterval(timer);
  }, []);

  // Auto-slide Admin Ads
  useEffect(() => {
      if(activeAds.length <= 1) return;
      const timer = setInterval(() => setAdIndex(prev => (prev + 1) % activeAds.length), 5000);
      return () => clearInterval(timer);
  }, [activeAds.length]);

  const copyUid = () => {
    if (userProfile?.ffUid) {
      navigator.clipboard.writeText(userProfile.ffUid);
      if(navigator.vibrate) navigator.vibrate(50);
    }
  };

  const handleAdClick = (link?: string) => {
      if(link) {
          window.open(link, '_blank');
      }
  }

  return (
    <Layout>
      <div className="space-y-6">
        
        {/* --- NEWS CAROUSEL --- */}
        <div className="relative h-10 overflow-hidden rounded-lg bg-black/20 border border-white/5 shadow-inner">
             <AnimatePresence mode="wait">
                 <motion.div 
                    key={newsIndex}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="absolute inset-0 flex items-center px-3 gap-3"
                 >
                     <div className={`w-1.5 h-1.5 rounded-full ${news[newsIndex].color} animate-pulse shadow-[0_0_10px_currentColor]`}></div>
                     <p className="text-xs font-medium text-gray-300 truncate">{news[newsIndex].text}</p>
                 </motion.div>
             </AnimatePresence>
        </div>

        {/* --- ADMIN ADVERTISEMENT SLIDER --- */}
        {activeAds.length > 0 && (
            <div className="relative w-full aspect-[21/9] sm:aspect-[32/9] rounded-2xl overflow-hidden border border-white/10 shadow-lg group">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeAds[adIndex].id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 cursor-pointer"
                        onClick={() => handleAdClick(activeAds[adIndex].link)}
                    >
                         <img 
                            src={activeAds[adIndex].imageUrl} 
                            alt="Advertisement" 
                            className="w-full h-full object-cover"
                         />
                         {/* Optional Overlay Title */}
                         {activeAds[adIndex].title && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 pt-10">
                                <p className="text-white text-sm font-bold flex items-center gap-1">
                                    {activeAds[adIndex].title} <ExternalLink size={10} className="text-gray-400" />
                                </p>
                            </div>
                         )}
                         <div className="absolute top-2 right-2 bg-black/60 px-2 py-0.5 rounded text-[8px] text-gray-400 border border-white/10">AD</div>
                    </motion.div>
                </AnimatePresence>
                
                {/* Dots Indicator */}
                {activeAds.length > 1 && (
                    <div className="absolute bottom-2 right-4 flex gap-1.5 z-10">
                        {activeAds.map((_, idx) => (
                            <div 
                                key={idx} 
                                className={`w-1.5 h-1.5 rounded-full transition-all ${idx === adIndex ? 'bg-brand-500 w-3' : 'bg-white/50'}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* Welcome & Stats Header - Optimized for Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* User Info Card */}
            <div className="flex items-center justify-between bg-brand-800/20 p-4 rounded-2xl border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
              
              <div className="flex-1 min-w-0 mr-4 z-10">
                <p className="text-gray-400 text-xs font-medium">Welcome back,</p>
                <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wide truncate">
                  {userProfile?.ffName || userProfile?.name || 'PLAYER'}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                   {userProfile?.clanTag && <Badge color="purple">{userProfile.clanTag}</Badge>}
                   <div className="flex items-center gap-1 text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/10">
                      <Flame size={10} className="text-orange-500" /> 
                      <span className="text-gray-300">Level {userProfile?.level || 1}</span>
                   </div>
                </div>
              </div>

              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-500 to-brand-purple p-[1px] shadow-lg shadow-brand-500/20 shrink-0 z-10">
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

            {/* Quick Actions - MOVED UP FOR BETTER ACCESSIBILITY */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => navigate('/tournaments')} 
                className="group relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-brand-600 to-brand-700 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 transition-all duration-300 active:scale-95 flex flex-col justify-between h-24"
              >
                <div className="absolute right-0 top-0 w-20 h-20 bg-white/10 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none"></div>
                <Swords size={24} className="text-white relative z-10" />
                <div className="relative z-10 text-left">
                    <span className="block font-display font-bold text-base text-white leading-none mb-0.5">JOIN MATCH</span>
                    <span className="text-[9px] text-brand-100 font-medium tracking-wide opacity-80">WIN PRIZES</span>
                </div>
              </button>

              <button 
                onClick={() => navigate('/wallet')} 
                className="group relative overflow-hidden rounded-xl p-4 bg-brand-800 border border-white/5 hover:border-brand-gold/50 transition-all duration-300 active:scale-95 flex flex-col justify-between h-24"
              >
                <div className="relative z-10 bg-brand-gold/20 w-fit p-1.5 rounded-lg text-brand-gold border border-brand-gold/20">
                  <Zap size={16} className="fill-brand-gold" />
                </div>
                <div className="relative z-10 text-left">
                    <span className="block font-display font-bold text-lg text-white leading-none mb-0.5">₹ {userProfile?.coins || 0}</span>
                    <span className="text-[9px] text-gray-400 font-medium tracking-wide">BALANCE</span>
                </div>
              </button>
            </div>
        </div>

        {/* Level Progress - Compact */}
        <div className="bg-brand-900/50 p-3 rounded-xl border border-white/5 flex items-center gap-4">
             <div className="flex-1 min-w-0">
                 <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wide">
                     <span>Elite Pass XP</span>
                     <span>{userProfile?.xp || 0} / {userProfile?.maxXp || 1000}</span>
                 </div>
                 <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(((userProfile?.xp || 0) / (userProfile?.maxXp || 1000)) * 100, 100)}%` }}
                        transition={{ duration: 1 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                     ></motion.div>
                 </div>
             </div>
        </div>

        {/* User Stats Card - Improved Grid for Small Screens */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500 to-brand-purple rounded-2xl blur opacity-10 group-hover:opacity-30 transition duration-500"></div>
          <Card className="relative bg-[#0f0f11] !p-0 overflow-hidden border border-white/5">
            <div className="p-4 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                    <Trophy className="text-brand-gold" size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-400 uppercase tracking-wider font-bold">FF UID</p>
                    <div className="flex items-center gap-2 cursor-pointer hover:text-brand-500 transition-colors" onClick={copyUid}>
                      <span className="font-mono text-white font-bold tracking-widest text-sm">{userProfile?.ffUid || 'NOT SET'}</span>
                      <Copy size={12} className="text-gray-500" />
                    </div>
                  </div>
                </div>
                <Badge color={userProfile?.status === 'active' ? 'green' : 'red'}>
                  {userProfile?.status.toUpperCase()}
                </Badge>
              </div>

              {/* Responsive Grid - 3 Columns */}
              <div className="grid grid-cols-3 divide-x divide-white/5 bg-white/5 rounded-xl border border-white/5 backdrop-blur-sm">
                <div className="p-3 text-center">
                  <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mb-1">Matches</p>
                  <p className="text-lg font-display font-bold text-white">0</p>
                </div>
                <div className="p-3 text-center">
                  <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mb-1">Kills</p>
                  <p className="text-lg font-display font-bold text-brand-500">0</p>
                </div>
                <div className="p-3 text-center">
                  <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mb-1">Wins</p>
                  <p className="text-lg font-display font-bold text-brand-gold">0</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* --- ADSTERRA / NETWORK AD CONTAINER --- */}
        <div className="w-full bg-[#1a1a1c] border border-white/5 rounded-xl p-2 flex flex-col items-center justify-center relative overflow-hidden min-h-[100px]">
             {/* 
                NOTE TO ADMIN/DEVELOPER: 
                Paste your Adsterra or Google Ads script code inside a component or create a specific div here.
                Since raw scripts can't be easily injected in React without `dangerouslySetInnerHTML`, 
                use the iframe method or a specific react-ad-component library for best results.
             */}
             <div className="text-center">
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-1">Sponsored</p>
                <div className="w-full h-auto bg-black/20 rounded border border-dashed border-gray-700 p-4 flex items-center justify-center">
                   {/* Placeholder for Adsterra Script */}
                   <p className="text-xs text-gray-500">ADSTERRA BANNER SPACE (320x50 / 300x250)</p>
                </div>
             </div>
        </div>
        
        {/* Featured Tournament */}
        <div onClick={() => navigate('/tournaments')} className="relative h-36 rounded-2xl overflow-hidden group cursor-pointer border border-white/10">
            <img 
                src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60" 
                alt="Featured"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
            <div className="absolute top-3 left-3 bg-brand-500 text-white text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-lg">
                <Star size={10} fill="currentColor" /> FEATURED
            </div>
            <div className="absolute bottom-4 left-4 right-4">
                <p className="text-[10px] text-brand-gold font-bold uppercase tracking-wider mb-1">Mega Pool • Squad</p>
                <h3 className="text-xl font-display font-bold text-white leading-none mb-2">Weekend Championship</h3>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                       <Trophy size={12} className="text-yellow-500" />
                       <span className="text-xs font-bold text-white">₹5,000 Pool</span>
                    </div>
                    <div className="flex items-center gap-1">
                       <Play size={12} className="text-green-500" />
                       <span className="text-xs font-bold text-white">Starts 8:00 PM</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Live Stream Carousel */}
        <div>
             <div className="flex items-center gap-2 mb-3 px-1">
                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                 <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Streams</h3>
             </div>
             <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                 {[1, 2, 3].map(i => (
                     <div key={i} className="min-w-[200px] sm:min-w-[240px] h-28 sm:h-32 rounded-xl bg-black relative overflow-hidden border border-white/10 group cursor-pointer active:scale-95 transition-transform">
                         <img src={`https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80`} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" alt="Stream" />
                         <div className="absolute inset-0 flex items-center justify-center">
                             <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-600/90 rounded-full flex items-center justify-center text-white pl-1 shadow-lg group-hover:scale-110 transition-transform">
                                 <Play size={14} fill="white" />
                             </div>
                         </div>
                         <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">LIVE</div>
                         <div className="absolute bottom-2 left-2 right-2">
                             <p className="text-xs font-bold text-white truncate">Grand Finals - Map {i}</p>
                             <p className="text-[9px] text-gray-300">RK Official</p>
                         </div>
                     </div>
                 ))}
             </div>
        </div>

        {/* Recent Activity */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-4 px-1">
             <h3 className="text-md font-display font-bold text-white tracking-wide border-l-2 border-brand-500 pl-3">RECENT MATCHES</h3>
             <button className="text-xs text-brand-500 font-bold flex items-center hover:text-brand-400 transition-colors py-2">VIEW ALL <ChevronRight size={12} /></button>
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