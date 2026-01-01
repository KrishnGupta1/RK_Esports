
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { LeaderboardEntry } from '../types';
import { Crown, Trophy, User, ArrowUp, ArrowDown, Minus, ShieldCheck, Crosshair, Skull, Swords, X, Flame, Medal, Star, Zap, Heart, UserPlus, Bell, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge, Card, Button, Modal, ModalHeader, ModalBody, ModalFooter } from '../components/UI';
import { useAuth } from '../contexts/AuthContext';

const Leaderboard: React.FC = () => {
  const { toggleFollow, toggleLike, sendFriendRequest, userProfile } = useAuth();
  const [timeFilter, setTimeFilter] = useState<'weekly' | 'all_time'>('weekly');
  const [selectedPlayer, setSelectedPlayer] = useState<LeaderboardEntry | null>(null);

  // Initial Data
  const [players, setPlayers] = useState<LeaderboardEntry[]>([
    { 
      uid: '1', 
      name: 'RK_KILLER', 
      photoURL: 'https://i.pinimg.com/736x/2e/0f/50/2e0f50b4313d3d63c224c6e9196b6307.jpg', 
      earnings: 15000, 
      matches: 45, 
      wins: 18,
      clan: 'RK OFFICIAL',
      kdRatio: 4.5,
      headshotRate: 65,
      trend: 'same',
      isVip: true,
      isAdmin: true,
      likes: 1200,
      followersCount: 500,
      achievements: ['Sharpshooter', 'Berserker', 'Richie Rich']
    },
    { 
      uid: '2', 
      name: 'Hydra_X', 
      photoURL: 'https://i.pinimg.com/564x/d1/8a/70/d18a7061794b998f48489e2402120db7.jpg', 
      earnings: 12500, 
      matches: 38, 
      wins: 12,
      clan: 'Hydra Esports',
      kdRatio: 3.8,
      headshotRate: 45,
      trend: 'up',
      isVip: true,
      likes: 850,
      followersCount: 320,
      achievements: ['Rising Star']
    },
    { 
      uid: '3', 
      name: 'Ninja_007', 
      photoURL: 'https://i.pinimg.com/564x/9d/d0/5c/9dd05c1d6835171731633538466d3a90.jpg', 
      earnings: 9800, 
      matches: 50, 
      wins: 8,
      clan: 'Team Elite',
      kdRatio: 2.9,
      headshotRate: 32,
      trend: 'down',
      likes: 400,
      followersCount: 150,
      achievements: ['Grinder']
    },
    { 
      uid: '4', 
      name: 'Slayer_OP', 
      photoURL: 'https://i.pinimg.com/564x/87/44/14/874414c97960350d1825656543b57f00.jpg', 
      earnings: 8000, 
      matches: 20, 
      wins: 6,
      clan: 'Lone Wolves',
      kdRatio: 3.2,
      headshotRate: 40,
      trend: 'up',
      likes: 120
    },
    { 
      uid: '5', 
      name: 'Venom', 
      earnings: 7500, 
      matches: 25, 
      wins: 4,
      clan: 'Syndicate',
      kdRatio: 2.1,
      headshotRate: 25,
      trend: 'down',
      likes: 90
    },
    { 
      uid: '6', 
      name: 'DarkLord', 
      earnings: 5000, 
      matches: 15, 
      wins: 2,
      clan: 'Darkness',
      kdRatio: 1.8,
      headshotRate: 20,
      trend: 'same',
      likes: 45
    },
  ]);

  const topPlayers = players; // Use state

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <ArrowUp size={12} className="text-green-500" />;
    if (trend === 'down') return <ArrowDown size={12} className="text-red-500" />;
    return <Minus size={12} className="text-gray-500" />;
  };

  const isFriend = (uid: string) => {
      return userProfile?.friends?.includes(uid);
  };

  const handleSocialAction = async (type: 'like' | 'follow' | 'friend') => {
      if(!selectedPlayer) return;
      
      if (type === 'like') {
          // Increment locally immediately
          const newLikes = (selectedPlayer.likes || 0) + 1;
          const updatedPlayer = { ...selectedPlayer, likes: newLikes };
          setSelectedPlayer(updatedPlayer);
          
          setPlayers(prev => prev.map(p => p.uid === selectedPlayer.uid ? updatedPlayer : p));
          
          await toggleLike(selectedPlayer.uid);
      } 
      else if (type === 'follow') {
          // Toggle follow count mock
          const isFollowing = false; // Mock toggle state
          const newCount = (selectedPlayer.followersCount || 0) + (isFollowing ? -1 : 1);
          const updatedPlayer = { ...selectedPlayer, followersCount: newCount };
          setSelectedPlayer(updatedPlayer);
          setPlayers(prev => prev.map(p => p.uid === selectedPlayer.uid ? updatedPlayer : p));
          
          await toggleFollow(selectedPlayer.uid);
          alert(`Followed ${selectedPlayer.name}!`);
      } 
      else if (type === 'friend') {
          await sendFriendRequest(selectedPlayer.uid);
          // Force re-render to update "Add" to "Added" state based on userProfile change in context
      }
  };

  return (
    <Layout>
      <div className="space-y-8">
        
        {/* Header Section */}
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-display font-bold text-white tracking-wide">LEADERBOARD</h2>
                <p className="text-gray-400 text-xs">Compete with the best to earn respect.</p>
            </div>
            
            <div className="flex bg-brand-800 rounded-lg p-1 border border-white/5">
                <button 
                    onClick={() => setTimeFilter('weekly')}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${timeFilter === 'weekly' ? 'bg-brand-500 text-white shadow-lg' : 'text-gray-500'}`}
                >
                    WEEKLY
                </button>
                <button 
                    onClick={() => setTimeFilter('all_time')}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${timeFilter === 'all_time' ? 'bg-brand-500 text-white shadow-lg' : 'text-gray-500'}`}
                >
                    ALL TIME
                </button>
            </div>
        </div>

        {/* Top 3 Podium - Responsive Scale */}
        <div className="flex items-end justify-center gap-1 sm:gap-6 px-0 mb-12 relative overflow-visible">
           {/* Background Glow */}
           <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full h-40 bg-brand-500/10 blur-[60px] rounded-full pointer-events-none"></div>

           {/* 2nd Place */}
           <motion.div 
             initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
             className="flex flex-col items-center cursor-pointer relative z-10 w-1/3 sm:w-auto"
             onClick={() => setSelectedPlayer(topPlayers[1])}
           >
              <div className="relative">
                  <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full border-2 border-gray-400 p-1 bg-gray-900 relative z-10">
                    <img src={topPlayers[1].photoURL || ''} alt="" className="w-full h-full rounded-full object-cover" />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-lg z-20 border border-white/20">#2</div>
              </div>
              
              <div className="mt-4 text-center w-full">
                  <p className="text-xs font-bold text-white truncate px-1">{topPlayers[1].name}</p>
                  <p className="text-[9px] text-gray-400 truncate">{topPlayers[1].clan}</p>
                  <p className="text-xs font-black text-brand-gold mt-0.5">₹{topPlayers[1].earnings}</p>
              </div>
              <div className="w-full sm:w-24 h-24 bg-gradient-to-t from-gray-900/80 to-gray-800/20 mt-2 rounded-t-2xl border-x border-t border-white/5 backdrop-blur-sm"></div>
           </motion.div>

           {/* 1st Place - The Champion */}
           <motion.div 
             initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, type: "spring" }}
             className="flex flex-col items-center z-20 -mb-6 cursor-pointer w-1/3 sm:w-auto"
             onClick={() => setSelectedPlayer(topPlayers[0])}
           >
              <div className="relative group">
                  <Crown size={24} className="sm:w-8 sm:h-8 text-brand-gold absolute -top-6 sm:-top-8 left-1/2 -translate-x-1/2 animate-bounce drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]" />
                  <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-brand-gold p-1 bg-black relative z-10 shadow-[0_0_30px_rgba(255,215,0,0.3)]">
                    <img src={topPlayers[0].photoURL || ''} alt="" className="w-full h-full rounded-full object-cover" />
                  </div>
                  <div className="absolute -bottom-2 sm:-bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-600 to-brand-gold text-black text-[10px] sm:text-xs font-black px-3 py-1 rounded shadow-lg z-20 border border-white/20">#1</div>
                  
                  {topPlayers[0].isAdmin && (
                      <div className="absolute top-0 right-0 bg-brand-500 text-white p-1 rounded-full border border-black shadow-lg" title="Admin / Owner">
                          <ShieldCheck size={10} />
                      </div>
                  )}
              </div>
              
              <div className="mt-4 sm:mt-5 text-center w-full">
                  <div className="flex items-center gap-1 justify-center flex-wrap">
                     <p className="text-xs sm:text-sm font-black text-white truncate px-1">{topPlayers[0].name}</p>
                     {topPlayers[0].isVip && <Badge color="purple">VIP</Badge>}
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-brand-gold font-bold truncate">{topPlayers[0].clan}</p>
                  <p className="text-base sm:text-xl font-black text-brand-gold mt-0.5 drop-shadow-md">₹{topPlayers[0].earnings}</p>
              </div>
              <div className="w-full sm:w-32 h-36 bg-gradient-to-t from-brand-gold/10 to-brand-gold/5 mt-2 rounded-t-2xl border-x border-t border-brand-gold/20 backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
              </div>
           </motion.div>

           {/* 3rd Place */}
           <motion.div 
             initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
             className="flex flex-col items-center cursor-pointer relative z-10 w-1/3 sm:w-auto"
             onClick={() => setSelectedPlayer(topPlayers[2])}
           >
              <div className="relative">
                  <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full border-2 border-orange-600 p-1 bg-gray-900 relative z-10">
                    <img src={topPlayers[2].photoURL || ''} alt="" className="w-full h-full rounded-full object-cover" />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-700 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-lg z-20 border border-white/20">#3</div>
              </div>
              
              <div className="mt-4 text-center w-full">
                  <p className="text-xs font-bold text-white truncate px-1">{topPlayers[2].name}</p>
                  <p className="text-[9px] text-gray-400 truncate">{topPlayers[2].clan}</p>
                  <p className="text-xs font-black text-brand-gold mt-0.5">₹{topPlayers[2].earnings}</p>
              </div>
              <div className="w-full sm:w-24 h-20 bg-gradient-to-t from-gray-900/80 to-gray-800/20 mt-2 rounded-t-2xl border-x border-t border-white/5 backdrop-blur-sm"></div>
           </motion.div>
        </div>

        {/* The Rest of the List (4-100) */}
        <div className="bg-brand-900/50 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden">
           {topPlayers.slice(3).map((player, idx) => (
             <motion.div 
                key={player.uid} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (idx * 0.1) }}
                onClick={() => setSelectedPlayer(player)}
                className="flex items-center p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer group"
             >
                {/* Rank & Trend */}
                <div className="flex flex-col items-center justify-center w-8 mr-2 gap-1">
                    <span className="text-sm font-bold text-gray-500">#{idx + 4}</span>
                    <div className="bg-black/40 rounded p-0.5">{getTrendIcon(player.trend)}</div>
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full p-[1px] bg-gradient-to-tr from-gray-700 to-gray-800 mr-3 shrink-0">
                   {player.photoURL ? (
                       <img src={player.photoURL} className="w-full h-full rounded-full object-cover" alt="" />
                   ) : (
                       <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-gray-500"><User size={16}/></div>
                   )}
                </div>

                {/* Name & Clan */}
                <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-2">
                       <p className="font-bold text-white truncate text-sm">{player.name}</p>
                       {player.isVip && <Badge color="purple">VIP</Badge>}
                   </div>
                   <p className="text-[10px] text-gray-400 flex items-center gap-1">
                       <ShieldCheck size={10} className="text-brand-500"/> {player.clan}
                   </p>
                </div>

                {/* Earnings */}
                <div className="text-right">
                   <p className="font-black text-brand-gold font-display text-sm">₹{player.earnings}</p>
                   <p className="text-[9px] text-gray-500 font-bold uppercase">Earned</p>
                </div>
             </motion.div>
           ))}
        </div>

        {/* --- STANDARDIZED PLAYER STATS MODAL --- */}
        {selectedPlayer && (
           <Modal isOpen={!!selectedPlayer} onClose={() => setSelectedPlayer(null)}>
              {/* Header is visually hidden or custom in this specific design, 
                  but we use the Modal structure for safety. 
                  Here we use a custom body wrapper to achieve the overlap look 
              */}
              <div className="flex-1 overflow-y-auto custom-scrollbar relative flex flex-col">
                  {/* Background Banner */}
                  <div className="h-28 bg-gradient-to-r from-brand-900 via-brand-800 to-brand-900 relative shrink-0">
                      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                      {selectedPlayer.isAdmin && (
                          <div className="absolute top-0 left-0 w-full h-1 bg-brand-500 shadow-[0_0_20px_#ff2e4d]"></div>
                      )}
                      <button onClick={() => setSelectedPlayer(null)} className="absolute top-4 right-4 p-2 bg-black/40 rounded-full text-white hover:bg-red-500 transition-colors z-20">
                          <X size={20} />
                      </button>
                  </div>

                  {/* Profile Info */}
                  <div className="px-6 -mt-14 flex flex-col items-center relative z-10 mb-6">
                      <div className="w-28 h-28 rounded-full border-4 border-brand-900 p-1 bg-black shadow-xl">
                          <img src={selectedPlayer.photoURL || ''} className="w-full h-full rounded-full object-cover" alt="" />
                      </div>
                      <h2 className="text-2xl font-bold text-white mt-3 flex items-center gap-2 text-center">
                          {selectedPlayer.name}
                          {selectedPlayer.isAdmin && <ShieldCheck size={20} className="text-blue-500 fill-blue-500/20" />}
                      </h2>
                      <p className="text-brand-gold font-display font-bold text-sm tracking-widest">{selectedPlayer.clan}</p>
                      
                      <div className="flex flex-wrap gap-2 justify-center mt-2">
                        {selectedPlayer.isAdmin ? (
                            <Badge color="red">RK ESPORTS OWNER</Badge>
                        ) : (
                            selectedPlayer.isVip && <Badge color="purple">VIP MEMBER</Badge>
                        )}
                      </div>
                      
                      {/* --- SOCIAL ACTIONS --- */}
                      <div className="flex items-center gap-4 mt-6">
                          <button 
                             onClick={() => handleSocialAction('like')}
                             className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
                          >
                              <div className="w-10 h-10 rounded-full bg-brand-800 border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-red-500 group-hover:bg-red-500/10 transition-colors">
                                  <Heart size={18} />
                              </div>
                              <span className="text-[10px] font-bold text-gray-400">{selectedPlayer.likes || 0}</span>
                          </button>
                          
                          <button 
                             onClick={() => handleSocialAction('follow')}
                             className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
                          >
                              <div className="w-10 h-10 rounded-full bg-brand-800 border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-blue-500 group-hover:bg-blue-500/10 transition-colors">
                                  <Bell size={18} />
                              </div>
                              <span className="text-[10px] font-bold text-gray-400">{selectedPlayer.followersCount || 0}</span>
                          </button>

                          <button 
                             onClick={() => !isFriend(selectedPlayer.uid) && handleSocialAction('friend')}
                             className="flex flex-col items-center gap-1 group active:scale-90 transition-transform disabled:opacity-70"
                             disabled={isFriend(selectedPlayer.uid)}
                          >
                              <div className={`w-10 h-10 rounded-full border border-white/10 flex items-center justify-center transition-colors ${isFriend(selectedPlayer.uid) ? 'bg-green-500/20 text-green-500 border-green-500/30' : 'bg-brand-800 text-gray-400 group-hover:text-green-500 group-hover:bg-green-500/10'}`}>
                                  {isFriend(selectedPlayer.uid) ? <Check size={18}/> : <UserPlus size={18} />}
                              </div>
                              <span className={`text-[10px] font-bold ${isFriend(selectedPlayer.uid) ? 'text-green-500' : 'text-gray-400'}`}>
                                  {isFriend(selectedPlayer.uid) ? 'Added' : 'Add'}
                              </span>
                          </button>
                      </div>
                  </div>

                  {/* Advanced Stats Grid */}
                  <div className="px-6 grid grid-cols-2 gap-3 mb-6">
                      <Card className="bg-white/5 !p-3 border-white/5 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors">
                          <Crosshair size={20} className="text-brand-500 mb-1" />
                          <span className="text-xl sm:text-2xl font-display font-bold text-white">{selectedPlayer.kdRatio}</span>
                          <span className="text-[10px] text-gray-400 uppercase font-bold">K/D Ratio</span>
                      </Card>
                      <Card className="bg-white/5 !p-3 border-white/5 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors">
                          <Skull size={20} className="text-purple-500 mb-1" />
                          <span className="text-xl sm:text-2xl font-display font-bold text-white">{selectedPlayer.headshotRate}%</span>
                          <span className="text-[10px] text-gray-400 uppercase font-bold">Headshot %</span>
                      </Card>
                      <Card className="bg-white/5 !p-3 border-white/5 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors">
                          <Trophy size={20} className="text-yellow-500 mb-1" />
                          <span className="text-xl sm:text-2xl font-display font-bold text-white">{selectedPlayer.wins}</span>
                          <span className="text-[10px] text-gray-400 uppercase font-bold">Booyahs</span>
                      </Card>
                      <Card className="bg-white/5 !p-3 border-white/5 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors">
                          <Swords size={20} className="text-green-500 mb-1" />
                          <span className="text-xl sm:text-2xl font-display font-bold text-white">{selectedPlayer.matches}</span>
                          <span className="text-[10px] text-gray-400 uppercase font-bold">Matches</span>
                      </Card>
                  </div>

                  {/* Achievements Section */}
                  <div className="px-6 mb-8">
                      <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                          <Medal size={14} className="text-brand-gold"/> Achievements
                      </h3>
                      <div className="flex flex-wrap gap-2">
                          {selectedPlayer.achievements && selectedPlayer.achievements.length > 0 ? (
                              selectedPlayer.achievements.map((ach, i) => (
                                  <div key={i} className="flex items-center gap-1.5 bg-brand-800 border border-white/10 px-3 py-1.5 rounded-full">
                                      <Star size={10} className="text-yellow-400 fill-yellow-400" />
                                      <span className="text-[10px] font-bold text-gray-200">{ach}</span>
                                  </div>
                              ))
                          