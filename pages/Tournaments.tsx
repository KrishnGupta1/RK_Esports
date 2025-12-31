import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, Badge, Button } from '../components/UI';
import { Users, Clock, Trophy, Map, ChevronRight, X, Lock, Copy, Sword, Search, Crosshair, AlertTriangle, Eye, Filter, ShieldAlert } from 'lucide-react';
import { Tournament } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Tournaments: React.FC = () => {
  const { tournaments, joinTournament, userProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'live' | 'completed'>('upcoming');
  const [selectedMatch, setSelectedMatch] = useState<Tournament | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [joining, setJoining] = useState(false);

  // Filters
  const filters = ['All', 'Solo', 'Duo', 'Squad', 'Solo vs Squad', 'Classic', 'CS-Ranked', 'Custom Lobby'];

  // Filter Logic
  const filteredTournaments = tournaments.filter(t => {
    const matchesTab = 
      (activeTab === 'upcoming' && t.status === 'open') ||
      (activeTab === 'live' && t.status === 'ongoing') ||
      (activeTab === 'completed' && t.status === 'completed');
    
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.map.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesMode = true;
    if (filterType !== 'All') {
        // Check if filter matches 'type' OR 'gameMode'
        matchesMode = t.type === filterType || t.gameMode === filterType;
    }

    return matchesTab && matchesSearch && matchesMode;
  });

  const handleJoin = async () => {
    if (!selectedMatch) return;
    
    if (userProfile && userProfile.coins < selectedMatch.entryFee) {
        if(confirm("Low Balance! Add money to wallet?")) {
            navigate('/wallet');
        }
        return;
    }

    if (!confirm(`Join ${selectedMatch.title} for ₹${selectedMatch.entryFee}?`)) return;

    setJoining(true);
    const result = await joinTournament(selectedMatch.id);
    setJoining(false);

    if (result.success) {
      alert("Success! You have joined the match.");
      setSelectedMatch(null); // Close modal
    } else {
      alert(result.message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied!');
  };

  const getSlotColor = (filled: number, total: number) => {
    const percentage = filled / total;
    if (percentage >= 0.9) return "bg-red-500 shadow-[0_0_10px_#ef4444]";
    if (percentage >= 0.5) return "bg-brand-gold shadow-[0_0_10px_#ffd700]";
    return "bg-brand-accent shadow-[0_0_10px_#00ffa3]";
  };

  return (
    <Layout>
      <div className="space-y-6 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between">
           <h2 className="text-2xl font-display font-bold text-white tracking-wide">ARENA</h2>
           {activeTab === 'live' && (
             <div className="bg-red-500/10 px-3 py-1 rounded-full border border-red-500/30 flex items-center gap-2 animate-pulse">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span className="text-[10px] font-bold text-red-500 tracking-wider">LIVE FEED ACTIVE</span>
             </div>
           )}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex gap-3">
          <div className="flex-1 relative group">
             <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-brand-500 transition-colors">
               <Search size={16} />
             </div>
             <input 
               type="text" 
               placeholder="Search map, mode or match..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full bg-brand-900/80 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500/50 transition-all backdrop-blur-md"
             />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map(mode => (
            <button
              key={mode}
              onClick={() => setFilterType(mode)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap border transition-all ${
                filterType === mode 
                  ? 'bg-white text-black border-white' 
                  : 'bg-transparent text-gray-500 border-gray-700 hover:border-gray-500'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
        
        {/* Tabs */}
        <div className="relative p-1 bg-black/40 backdrop-blur-md rounded-xl border border-white/5 flex gap-1">
          {['upcoming', 'live', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`relative flex-1 py-2.5 text-xs font-bold font-display uppercase tracking-wider rounded-lg transition-all duration-300 z-10 ${
                activeTab === tab 
                  ? 'text-white shadow-lg' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute inset-0 bg-brand-700/80 rounded-lg border border-white/10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab}</span>
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-4 min-h-[50vh]">
          {filteredTournaments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 space-y-4">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                 <Filter size={24} className="opacity-20" />
              </div>
              <p>No matches found matching your filters.</p>
            </div>
          )}

          {filteredTournaments.map((t, index) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden group cursor-pointer hover:border-brand-500/30 transition-all !p-0">
                 <div onClick={() => setSelectedMatch(t)} className="p-4">
                  
                  {/* Neon Glow on Hover */}
                  <div className="absolute inset-0 bg-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="flex gap-4 relative z-10">
                    {/* Image Thumbnail */}
                    <div className="w-24 h-24 bg-gray-900 rounded-xl flex-shrink-0 overflow-hidden relative shadow-lg border border-white/10">
                      <img src={t.image} alt="Map" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      
                      {/* Live Badge Overlay */}
                      {t.status === 'ongoing' && (
                        <div className="absolute top-1 left-1 right-1 flex justify-center">
                          <span className="text-[8px] font-black bg-red-600 text-white px-2 py-0.5 rounded shadow-lg animate-pulse">LIVE</span>
                        </div>
                      )}

                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="bg-black/60 p-1.5 rounded-lg backdrop-blur-sm border border-white/10">
                           <Eye size={16} className="text-white" />
                         </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-display font-bold text-lg text-white truncate pr-2 leading-tight">{t.title}</h3>
                          {t.status === 'ongoing' ? (
                             <span className="text-[10px] font-bold text-red-400 flex items-center gap-1"><Crosshair size={10}/> SPECTATING</span>
                          ) : (
                            t.isJoined && <Badge color="green">JOINED</Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mt-2">
                          <span className="flex items-center gap-1"><Clock size={12} className="text-brand-500"/> {t.startTime}</span>
                          <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                          <span className="flex items-center gap-1 uppercase text-gray-300"><Map size={12}/> {t.map}</span>
                          <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                          <Badge color="blue">{t.type}</Badge>
                        </div>
                      </div>
                      
                      {/* Stats Row */}
                      <div className="flex items-end justify-between mt-3">
                         <div className="flex items-center gap-3">
                           <div>
                             <p className="text-[10px] text-gray-500 uppercase font-bold">Prize</p>
                             <p className="text-sm font-bold text-brand-gold font-display">₹{t.prizePool}</p>
                           </div>
                           <div className="w-[1px] h-6 bg-white/10"></div>
                           <div>
                             <p className="text-[10px] text-gray-500 uppercase font-bold">Per Kill</p>
                             <p className="text-sm font-bold text-white font-display">₹{t.perKill}</p>
                           </div>
                         </div>
                         
                         <Button 
                            variant={t.isJoined ? 'secondary' : 'primary'} 
                            className="!w-auto !py-1.5 !px-5 text-xs h-8 !rounded-lg"
                          >
                            {t.isJoined ? 'VIEW' : `₹${t.entryFee}`}
                         </Button>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Progress Bar */}
                  <div className="mt-4 flex items-center gap-2">
                     <div className="relative h-2 flex-1 bg-gray-800 rounded-full overflow-hidden">
                       <div 
                         className={`absolute top-0 left-0 h-full transition-all duration-500 ${getSlotColor(t.joined, t.slots)}`} 
                         style={{ width: `${(t.joined / t.slots) * 100}%` }}
                       ></div>
                       <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzhhYWGMYAEYB8RmROaABADeOQ8CXl/xfgAAAABJRU5ErkJggg==')] opacity-20"></div>
                     </div>
                     <span className="text-[10px] font-bold text-gray-400 font-mono whitespace-nowrap">{t.joined}/{t.slots}</span>
                  </div>
                  
                  {/* Status Text */}
                  {t.slots - t.joined < 10 && t.status === 'open' && (
                     <p className="text-[10px] text-brand-500 font-bold mt-1 text-right animate-pulse">FILLING FAST!</p>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Detailed Modal */}
        <AnimatePresence>
          {selectedMatch && (
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-[60] bg-brand-950/95 backdrop-blur-md flex flex-col"
            >
              {/* Header */}
              <div className="h-16 border-b border-white/5 flex items-center justify-between px-4 shrink-0 bg-brand-900/50">
                 <button onClick={() => setSelectedMatch(null)} className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors">
                   <ChevronRight size={24} className="rotate-180" />
                 </button>
                 <h2 className="font-display font-bold text-white text-lg tracking-wide uppercase truncate max-w-[200px]">{selectedMatch.title}</h2>
                 <button onClick={() => setSelectedMatch(null)} className="p-2 -mr-2 text-gray-400 hover:text-white transition-colors">
                   <X size={24} />
                 </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                
                {/* Hero Image */}
                <div className="w-full h-40 rounded-2xl overflow-hidden relative border border-white/10 shadow-2xl">
                    <img src={selectedMatch.image} alt="Banner" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/20 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 flex gap-2">
                        <Badge color="yellow">{selectedMatch.map}</Badge>
                        <Badge color="purple">{selectedMatch.type}</Badge>
                        <Badge color="blue">{selectedMatch.gameMode}</Badge>
                    </div>
                </div>

                {/* Room ID Section */}
                {selectedMatch.isJoined && (
                  <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 border border-blue-500/30 rounded-2xl p-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-20 text-blue-500 group-hover:scale-110 transition-transform">
                      <Lock size={100} />
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-blue-400 font-bold font-display uppercase tracking-widest text-sm flex items-center gap-2 mb-4">
                        <Lock size={14} /> Classified Intel
                      </h3>
                      
                      {selectedMatch.roomId ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-black/40 p-3 rounded-xl border border-blue-500/20 backdrop-blur-sm">
                            <p className="text-[10px] text-blue-300 uppercase font-bold mb-1">Room ID</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-mono font-bold text-white tracking-widest">{selectedMatch.roomId}</span>
                              <button onClick={() => copyToClipboard(selectedMatch.roomId!)} className="text-blue-400 hover:text-white">
                                <Copy size={16} />
                              </button>
                            </div>
                          </div>
                          <div className="bg-black/40 p-3 rounded-xl border border-blue-500/20 backdrop-blur-sm">
                            <p className="text-[10px] text-blue-300 uppercase font-bold mb-1">Password</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-mono font-bold text-white tracking-widest">{selectedMatch.roomPassword}</span>
                              <button onClick={() => copyToClipboard(selectedMatch.roomPassword!)} className="text-blue-400 hover:text-white">
                                <Copy size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-black/20 rounded-xl border border-dashed border-blue-500/30">
                          <p className="text-blue-200 text-sm font-medium animate-pulse">Waiting for credentials...</p>
                          <p className="text-blue-400/60 text-xs mt-1">Credentials reveal 15 mins before start</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center gap-2">
                    <Trophy size={24} className="text-brand-gold drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]" />
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">PRIZE POOL</p>
                      <p className="text-xl font-display font-bold text-white">₹{selectedMatch.prizePool}</p>
                    </div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center gap-2">
                    <Sword size={24} className="text-brand-500 drop-shadow-[0_0_10px_rgba(255,46,77,0.5)]" />
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">PER KILL</p>
                      <p className="text-xl font-display font-bold text-white">₹{selectedMatch.perKill}</p>
                    </div>
                  </div>
                </div>

                {/* Prize Breakdown */}
                <div>
                   <div className="flex items-center gap-2 mb-4">
                      <div className="p-1.5 bg-brand-gold/10 rounded-lg text-brand-gold">
                         <Trophy size={18} />
                      </div>
                      <h3 className="font-display font-bold text-white text-md tracking-widest uppercase">Prize Distribution</h3>
                   </div>
                   <div className="bg-brand-900/50 rounded-2xl border border-white/5 overflow-hidden">
                      {selectedMatch.prizeDistribution.map((prize, idx) => (
                        <div key={idx} className="flex justify-between items-center px-5 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                           <div className="flex items-center gap-4">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shadow-lg ${
                                idx === 0 ? 'bg-brand-gold text-black shadow-yellow-500/20' : 
                                idx === 1 ? 'bg-gray-300 text-black' :
                                idx === 2 ? 'bg-orange-700 text-white' : 'bg-brand-800 text-gray-400'
                              }`}>#{prize.rank}</div>
                              <span className="text-gray-300 text-sm font-medium">Rank {prize.rank}</span>
                           </div>
                           <span className="font-bold text-brand-gold font-display text-lg">₹{prize.amount}</span>
                        </div>
                      ))}
                   </div>
                </div>

                {/* Rules */}
                <div className="mt-6">
                   <div className="flex items-center gap-2 mb-4">
                      <div className="p-1.5 bg-brand-500/10 rounded-lg text-brand-500">
                         <ShieldAlert size={18} />
                      </div>
                      <h3 className="font-display font-bold text-white text-md tracking-widest uppercase">Match Rules</h3>
                   </div>
                   <div className="bg-brand-900/50 rounded-2xl border border-white/5 p-5">
                      <ul className="space-y-3">
                        {selectedMatch.rules.map((rule, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shadow-[0_0_5px_#ff2e4d]"></span>
                            {rule}
                          </li>
                        ))}
                      </ul>
                   </div>
                </div>

                <div className="h-20"></div>
              </div>

              {/* Bottom Action Bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-brand-950/80 backdrop-blur-xl border-t border-white/10 p-4 safe-area-bottom">
                 {selectedMatch.isJoined ? (
                    <Button disabled className="bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 shadow-none">
                       JOINED SUCCESSFULLY
                    </Button>
                 ) : (
                    <div className="space-y-2">
                       {userProfile && userProfile.coins < selectedMatch.entryFee && (
                          <div className="flex items-center justify-center gap-2 text-xs text-red-400 font-bold animate-pulse">
                             <AlertTriangle size={12}/> Low Balance: ₹{userProfile.coins}
                          </div>
                       )}
                       <Button 
                          onClick={handleJoin}
                          disabled={joining || (userProfile ? userProfile.coins < selectedMatch.entryFee : true)}
                          className={userProfile && userProfile.coins >= selectedMatch.entryFee ? "neon-shadow" : "opacity-50"}
                       >
                          {joining ? 'JOINING...' : `JOIN MATCH - ₹${selectedMatch.entryFee}`}
                       </Button>
                    </div>
                 )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default Tournaments;