
import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { LeaderboardEntry } from '../types';
import { Crown, Trophy, User, ArrowUp, ArrowDown, Minus, ShieldCheck, Crosshair, Skull, Swords, X, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge, Card } from '../components/UI';

const Leaderboard: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState<'weekly' | 'all_time'>('weekly');
  const [selectedPlayer, setSelectedPlayer] = useState<LeaderboardEntry | null>(null);

  // Enhanced Mock Data with Real Image URLs and Stats
  const topPlayers: LeaderboardEntry[] = [
    { 
      uid: '1', 
      name: 'RK_KILLER', 
      photoURL: 'https://i.pinimg.com/736x/2e/0f/50/2e0f50b4313d3d63c224c6e9196b6307.jpg', // Cool Gaming Avatar
      earnings: 15000, 
      matches: 45, 
      wins: 18,
      clan: 'RK OFFICIAL',
      kdRatio: 4.5,
      headshotRate: 65,
      trend: 'same',
      isVip: true,
      isAdmin: true
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
      isVip: true
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
      trend: 'down'
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
      trend: 'up'
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
      trend: 'down'
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
      trend: 'same'
    },
  ];

  const getRankStyle = (rank: number) => {
    if (rank === 0) return "bg-gradient-to-t from-yellow-600 to-brand-gold border-yellow-400 shadow-[0_0_20px_rgba(255,215,0,0.4)] scale-110 z-20"; // 1st
    if (rank === 1) return "bg-gradient-to-t from-gray-700 to-gray-400 border-gray-400 mt-8 z-10"; // 2nd
    if (rank === 2) return "bg-gradient-to-t from-orange-800 to-orange-600 border-orange-500 mt-10 z-10"; // 3rd
    return "";
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <ArrowUp size={12} className="text-green-500" />;
    if (trend === 'down') return <ArrowDown size={12} className="text-red-500" />;
    return <Minus size={12} className="text-gray-500" />;
  };

  return (
    <Layout>
      <div className="space-y-8 pb-10">
        
        {/* Header Section */}
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-display font-bold text-white tracking-wide">LEADERBOARD</h2>
                <p className="text-gray-400 text-xs">Compete with the best to earn respect.</p>
            </div>
            
            {/* Feature 5: Toggle Weekly/AllTime */}
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

        {/* Top 3 Podium - Enhanced Visuals */}
        <div className="flex items-end justify-center gap-2 sm:gap-6 px-2 mb-12 relative">
           {/* Background Glow */}
           <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full h-40 bg-brand-500/10 blur-[60px] rounded-full pointer-events-none"></div>

           {/* 2nd Place */}
           <motion.div 
             initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
             className="flex flex-col items-center cursor-pointer"
             onClick={() => setSelectedPlayer(topPlayers[1])}
           >
              <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-gray-400 p-1 bg-gray-900 relative z-10">
                    <img src={topPlayers[1].photoURL || ''} alt="" className="w-full h-full rounded-full object-cover" />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-lg z-20 border border-white/20">#2</div>
              </div>
              
              <div className="mt-4 text-center">
                  <p className="text-xs font-bold text-white truncate max-w-[80px]">{topPlayers[1].name}</p>
                  <p className="text-[10px] text-gray-400">{topPlayers[1].clan}</p>
                  <p className="text-sm font-black text-brand-gold mt-1">₹{topPlayers[1].earnings}</p>
              </div>
              <div className="w-16 sm:w-24 h-24 bg-gradient-to-t from-gray-900/80 to-gray-800/20 mt-2 rounded-t-2xl border-x border-t border-white/5 backdrop-blur-sm"></div>
           </motion.div>

           {/* 1st Place - The Champion */}
           <motion.div 
             initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, type: "spring" }}
             className="flex flex-col items-center z-10 -mb-6 cursor-pointer"
             onClick={() => setSelectedPlayer(topPlayers[0])}
           >
              <div className="relative group">
                  <Crown size={32} className="text-brand-gold absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]" />
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-brand-gold p-1 bg-black relative z-10 shadow-[0_0_30px_rgba(255,215,0,0.3)]">
                    <img src={topPlayers[0].photoURL || ''} alt="" className="w-full h-full rounded-full object-cover" />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-600 to-brand-gold text-black text-xs font-black px-3 py-1 rounded shadow-lg z-20 border border-white/20">#1</div>
                  
                  {/* Admin/Verified Badge */}
                  {topPlayers[0].isAdmin && (
                      <div className="absolute top-0 right-0 bg-brand-500 text-white p-1 rounded-full border border-black shadow-lg" title="Admin / Owner">
                          <ShieldCheck size={12} />
                      </div>
                  )}
              </div>
              
              <div className="mt-5 text-center">
                  <div className="flex items-center gap-1 justify-center">
                     <p className="text-sm font-black text-white truncate max-w-[100px]">{topPlayers[0].name}</p>
                     {topPlayers[0].isVip && <Badge color="purple">VIP</Badge>}
                  </div>
                  <p className="text-[10px] text-brand-gold font-bold">{topPlayers[0].clan}</p>
                  <p className="text-xl font-black text-brand-gold mt-1 drop-shadow-md">₹{topPlayers[0].earnings}</p>
              </div>
              <div className="w-20 sm:w-32 h-36 bg-gradient-to-t from-brand-gold/10 to-brand-gold/5 mt-2 rounded-t-2xl border-x border-t border-brand-gold/20 backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
              </div>
           </motion.div>

           {/* 3rd Place */}
           <motion.div 
             initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
             className="flex flex-col items-center cursor-pointer"
             onClick={() => setSelectedPlayer(topPlayers[2])}
           >
              <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-orange-600 p-1 bg-gray-900 relative z-10">
                    <img src={topPlayers[2].photoURL || ''} alt="" className="w-full h-full rounded-full object-cover" />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-700 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-lg z-20 border border-white/20">#3</div>
              </div>
              
              <div className="mt-4 text-center">
                  <p className="text-xs font-bold text-white truncate max-w-[80px]">{topPlayers[2].name}</p>
                  <p className="text-[10px] text-gray-400">{topPlayers[2].clan}</p>
                  <p className="text-sm font-black text-brand-gold mt-1">₹{topPlayers[2].earnings}</p>
              </div>
              <div className="w-16 sm:w-24 h-20 bg-gradient-to-t from-gray-900/80 to-gray-800/20 mt-2 rounded-t-2xl border-x border-t border-white/5 backdrop-blur-sm"></div>
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

                {/* Stats Mini */}
                <div className="mr-4 hidden sm:block text-right">
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Wins</p>
                    <p className="text-white font-bold text-xs">{player.wins}</p>
                </div>

                {/* Earnings */}
                <div className="text-right">
                   <p className="font-black text-brand-gold font-display text-sm">₹{player.earnings}</p>
                   <p className="text-[9px] text-gray-500 font-bold uppercase">Earned</p>
                </div>
             </motion.div>
           ))}
        </div>

        {/* Feature 5: Player Stats Modal */}
        <AnimatePresence>
            {selectedPlayer && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                    onClick={() => setSelectedPlayer(null)}
                >
                    <motion.div 
                        initial={{ scale: 0.9, y: 50 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 50 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-brand-900 w-full max-w-sm rounded-3xl border border-white/10 relative overflow-hidden shadow-2xl"
                    >
                        {/* Background Banner */}
                        <div className="h-24 bg-gradient-to-r from-brand-900 via-brand-800 to-brand-900 relative">
                             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                             {selectedPlayer.isAdmin && (
                                 <div className="absolute top-0 left-0 w-full h-1 bg-brand-500 shadow-[0_0_20px_#ff2e4d]"></div>
                             )}
                             <button onClick={() => setSelectedPlayer(null)} className="absolute top-3 right-3 p-1.5 bg-black/40 rounded-full text-white hover:bg-red-500 transition-colors z-20">
                                 <X size={16} />
                             </button>
                        </div>

                        {/* Profile Info */}
                        <div className="px-6 -mt-12 flex flex-col items-center relative z-10">
                            <div className="w-24 h-24 rounded-full border-4 border-brand-900 p-1 bg-black shadow-xl">
                                <img src={selectedPlayer.photoURL || ''} className="w-full h-full rounded-full object-cover" alt="" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mt-2 flex items-center gap-2">
                                {selectedPlayer.name}
                                {selectedPlayer.isAdmin && <ShieldCheck size={20} className="text-blue-500 fill-blue-500/20" />}
                            </h2>
                            <p className="text-brand-gold font-display font-bold text-sm tracking-widest">{selectedPlayer.clan}</p>
                            
                            {selectedPlayer.isAdmin ? (
                                <Badge color="red" className="mt-2">RK ESPORTS OWNER</Badge>
                            ) : (
                                selectedPlayer.isVip && <Badge color="purple" className="mt-2">VIP MEMBER</Badge>
                            )}
                        </div>

                        {/* Advanced Stats Grid */}
                        <div className="p-6 grid grid-cols-2 gap-3">
                            <Card className="bg-white/5 !p-3 border-white/5 flex flex-col items-center justify-center text-center">
                                <Crosshair size={20} className="text-brand-500 mb-1" />
                                <span className="text-2xl font-display font-bold text-white">{selectedPlayer.kdRatio}</span>
                                <span className="text-[10px] text-gray-400 uppercase font-bold">K/D Ratio</span>
                            </Card>
                            <Card className="bg-white/5 !p-3 border-white/5 flex flex-col items-center justify-center text-center">
                                <Skull size={20} className="text-purple-500 mb-1" />
                                <span className="text-2xl font-display font-bold text-white">{selectedPlayer.headshotRate}%</span>
                                <span className="text-[10px] text-gray-400 uppercase font-bold">Headshot %</span>
                            </Card>
                            <Card className="bg-white/5 !p-3 border-white/5 flex flex-col items-center justify-center text-center">
                                <Trophy size={20} className="text-yellow-500 mb-1" />
                                <span className="text-2xl font-display font-bold text-white">{selectedPlayer.wins}</span>
                                <span className="text-[10px] text-gray-400 uppercase font-bold">Booyahs</span>
                            </Card>
                            <Card className="bg-white/5 !p-3 border-white/5 flex flex-col items-center justify-center text-center">
                                <Swords size={20} className="text-green-500 mb-1" />
                                <span className="text-2xl font-display font-bold text-white">{selectedPlayer.matches}</span>
                                <span className="text-[10px] text-gray-400 uppercase font-bold">Matches</span>
                            </Card>
                        </div>

                        {/* Footer Info */}
                        <div className="bg-black/30 p-4 text-center border-t border-white/5">
                            <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
                                <Flame size={14} className="text-orange-500" />
                                <span>Trending: {selectedPlayer.trend.toUpperCase()} this week</span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

      </div>
    </Layout>
  );
};

export default Leaderboard;
