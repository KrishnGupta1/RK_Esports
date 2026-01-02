
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { LeaderboardEntry } from '../types';
import { Crown, Trophy, User, ArrowUp, ArrowDown, Minus, ShieldCheck, Crosshair, Skull, Swords, X, Flame, Medal, Star, UserPlus, Check, Award, BadgeCheck, MessageCircle, Trash2, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge, Card, Modal } from '../components/UI';
import { useAuth } from '../contexts/AuthContext';
import { db, isConfigured } from '../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

const Leaderboard: React.FC = () => {
  const { toggleLike, sendFriendRequest, removeFriend, userProfile } = useAuth();
  const [timeFilter, setTimeFilter] = useState<'weekly' | 'all_time'>('weekly');
  const [selectedPlayer, setSelectedPlayer] = useState<LeaderboardEntry | null>(null);
  const [players, setPlayers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
        if (isConfigured && db) {
            try {
                // Fetch top 50 users sorted by coins (earnings)
                // In a real app, you might have a dedicated 'stats.earnings' field
                const q = query(collection(db, 'users'), orderBy('coins', 'desc'), limit(50));
                const snap = await getDocs(q);
                const list = snap.docs.map(doc => {
                    const data = doc.data();
                    // Map UserProfile to LeaderboardEntry
                    return {
                        uid: doc.id,
                        name: data.name || 'Unknown',
                        photoURL: data.photoURL,
                        earnings: data.coins || 0, // Using coins as proxy for earnings
                        matches: Number(data.stats?.matches || 0),
                        wins: Number(data.stats?.wins || 0),
                        clan: data.clanTag || 'No Clan',
                        kdRatio: Number(data.stats?.kd || 0),
                        headshotRate: Number(data.stats?.headshot || 0),
                        trend: 'same', // Calculated on backend usually
                        isVip: data.role === 'vip',
                        isAdmin: data.role === 'admin',
                        isVerified: data.isVerified,
                        customTag: data.customTag,
                        likes: data.likes || 0,
                        activeBadge: data.activeBadge,
                        achievements: data.achievements
                    } as LeaderboardEntry;
                });
                setPlayers(list);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            }
        }
        setLoading(false);
    };

    fetchLeaderboard();
  }, [timeFilter]);

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <ArrowUp size={12} className="text-green-500" />;
    if (trend === 'down') return <ArrowDown size={12} className="text-red-500" />;
    return <Minus size={12} className="text-gray-500" />;
  };

  const isFriend = (uid: string) => userProfile?.friends?.includes(uid);
  const isRequestSent = (uid: string) => userProfile?.friendRequestsSent?.includes(uid);

  const handleSocialAction = async (type: 'like' | 'friend' | 'delete_friend') => {
      if(!selectedPlayer) return;
      
      if (type === 'like') {
          const storedLikes = localStorage.getItem('my_liked_users');
          const likedList = storedLikes ? JSON.parse(storedLikes) : [];
          
          if(!likedList.includes(selectedPlayer.uid)) {
              const newLikes = (selectedPlayer.likes || 0) + 1;
              const updatedPlayer = { ...selectedPlayer, likes: newLikes };
              setSelectedPlayer(updatedPlayer);
              setPlayers(prev => prev.map(p => p.uid === selectedPlayer.uid ? updatedPlayer : p));
              await toggleLike(selectedPlayer.uid);
              
              likedList.push(selectedPlayer.uid);
              localStorage.setItem('my_liked_users', JSON.stringify(likedList));
          } else {
              alert("You have already liked this player!");
          }
      } 
      else if (type === 'friend') {
          await sendFriendRequest(selectedPlayer.uid);
      }
      else if (type === 'delete_friend') {
          if(confirm("Are you sure you want to remove this friend?")) {
            await removeFriend(selectedPlayer.uid);
            setSelectedPlayer({...selectedPlayer}); 
          }
      }
  };

  if (loading) return <Layout><div className="flex justify-center pt-20"><div className="animate-spin h-8 w-8 border-2 border-brand-500 rounded-full border-t-transparent"></div></div></Layout>;

  if (players.length === 0) return <Layout><div className="text-center pt-20 text-gray-500">No active players found.</div></Layout>;

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

        {/* Top 3 Podium */}
        <div className="flex items-end justify-center gap-1 sm:gap-6 px-0 mb-12 relative overflow-visible">
           {/* Background Glow */}
           <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full h-40 bg-brand-500/10 blur-[60px] rounded-full pointer-events-none"></div>

           {/* 2nd Place */}
           {players[1] && (
             <motion.div 
               initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
               className="flex flex-col items-center cursor-pointer relative z-10 w-1/3 sm:w-auto"
               onClick={() => setSelectedPlayer(players[1])}
             >
                <div className="relative">
                    <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full border-2 border-gray-400 p-1 bg-gray-900 relative z-10">
                      {players[1].photoURL ? <img src={players[1].photoURL} alt="" className="w-full h-full rounded-full object-cover" /> : <User className="w-full h-full p-2 text-gray-500"/>}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-lg z-20 border border-white/20">#2</div>
                </div>
                
                <div className="mt-4 text-center w-full">
                    <div className="flex items-center justify-center gap-1">
                      <p className="text-xs font-bold text-white truncate px-1">{players[1].name}</p>
                      {players[1].isVerified && <BadgeCheck size={12} className="text-blue-500 fill-blue-500/20" />}
                    </div>
                    <p className="text-[9px] text-yellow-400 font-bold truncate">{players[1].clan}</p>
                    <p className="text-xs font-black text-brand-gold mt-0.5">₹{players[1].earnings}</p>
                </div>
                <div className="w-full sm:w-24 h-24 bg-gradient-to-t from-gray-900/80 to-gray-800/20 mt-2 rounded-t-2xl border-x border-t border-white/5 backdrop-blur-sm"></div>
             </motion.div>
           )}

           {/* 1st Place */}
           {players[0] && (
             <motion.div 
               initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, type: "spring" }}
               className="flex flex-col items-center z-20 -mb-6 cursor-pointer w-1/3 sm:w-auto"
               onClick={() => setSelectedPlayer(players[0])}
             >
                <div className="relative group">
                    <Crown size={24} className="sm:w-8 sm:h-8 text-brand-gold absolute -top-6 sm:-top-8 left-1/2 -translate-x-1/2 animate-bounce drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]" />
                    <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-brand-gold p-1 bg-black relative z-10 shadow-[0_0_30px_rgba(255,215,0,0.3)]">
                      {players[0].photoURL ? <img src={players[0].photoURL} alt="" className="w-full h-full rounded-full object-cover" /> : <User className="w-full h-full p-4 text-gray-500"/>}
                    </div>
                    <div className="absolute -bottom-2 sm:-bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-600 to-brand-gold text-black text-[10px] sm:text-xs font-black px-3 py-1 rounded shadow-lg z-20 border border-white/20">#1</div>
                </div>
                
                <div className="mt-4 sm:mt-5 text-center w-full">
                    <div className="flex items-center gap-1 justify-center flex-wrap">
                       <p className="text-xs sm:text-sm font-black text-white truncate px-1">{players[0].name}</p>
                       {players[0].isVerified && <BadgeCheck size={14} className="text-blue-500 fill-blue-500/20" />}
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-yellow-400 font-bold truncate tracking-wide">{players[0].clan}</p>
                    <p className="text-base sm:text-xl font-black text-brand-gold mt-0.5 drop-shadow-md">₹{players[0].earnings}</p>
                </div>
                <div className="w-full sm:w-32 h-36 bg-gradient-to-t from-brand-gold/10 to-brand-gold/5 mt-2 rounded-t-2xl border-x border-t border-brand-gold/20 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                </div>
             </motion.div>
           )}

           {/* 3rd Place */}
           {players[2] && (
             <motion.div 
               initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
               className="flex flex-col items-center cursor-pointer relative z-10 w-1/3 sm:w-auto"
               onClick={() => setSelectedPlayer(players[2])}
             >
                <div className="relative">
                    <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full border-2 border-orange-600 p-1 bg-gray-900 relative z-10">
                      {players[2].photoURL ? <img src={players[2].photoURL} alt="" className="w-full h-full rounded-full object-cover" /> : <User className="w-full h-full p-2 text-gray-500"/>}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-700 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-lg z-20 border border-white/20">#3</div>
                </div>
                
                <div className="mt-4 text-center w-full">
                    <div className="flex items-center justify-center gap-1">
                       <p className="text-xs font-bold text-white truncate px-1">{players[2].name}</p>
                       {players[2].isVerified && <BadgeCheck size={12} className="text-blue-500 fill-blue-500/20" />}
                    </div>
                    <p className="text-[9px] text-yellow-400 font-bold truncate">{players[2].clan}</p>
                    <p className="text-xs font-black text-brand-gold mt-0.5">₹{players[2].earnings}</p>
                </div>
                <div className="w-full sm:w-24 h-20 bg-gradient-to-t from-gray-900/80 to-gray-800/20 mt-2 rounded-t-2xl border-x border-t border-white/5 backdrop-blur-sm"></div>
             </motion.div>
           )}
        </div>

        {/* The Rest of the List (4-50) */}
        <div className="bg-brand-900/50 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden">
           {players.slice(3).map((player, idx) => (
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
                       {player.isVerified && <BadgeCheck size={14} className="text-blue-500 fill-blue-500/20" />}
                       {player.isVip && <Badge color="purple">VIP</Badge>}
                   </div>
                   <p className="text-[10px] text-yellow-500 font-bold flex items-center gap-1">
                       {player.clan}
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

        {/* --- PLAYER STATS MODAL --- */}
        {selectedPlayer && (
           <Modal isOpen={!!selectedPlayer} onClose={() => setSelectedPlayer(null)}>
              <div className="flex-1 overflow-y-auto custom-scrollbar relative flex flex-col">
                  {/* Background Banner */}
                  <div className="h-28 bg-gradient-to-r from-brand-900 via-brand-800 to-brand-900 relative shrink-0">
                      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                      <button onClick={() => setSelectedPlayer(null)} className="absolute top-4 right-4 p-2 bg-black/40 rounded-full text-white hover:bg-red-500 transition-colors z-20">
                          <X size={20} />
                      </button>
                  </div>

                  {/* Profile Info */}
                  <div className="px-6 -mt-14 flex flex-col items-center relative z-10 mb-6">
                      <div className="w-28 h-28 rounded-full border-4 border-brand-900 p-1 bg-black shadow-xl relative">
                          {selectedPlayer.photoURL ? (
                             <img src={selectedPlayer.photoURL} className="w-full h-full rounded-full object-cover" alt="" />
                          ) : (
                             <User className="w-full h-full p-6 text-gray-500" />
                          )}
                      </div>
                      
                      <h2 className="text-2xl font-bold text-white mt-3 flex items-center gap-2 text-center">
                          {selectedPlayer.name}
                          {selectedPlayer.isVerified && <BadgeCheck size={20} className="text-blue-500 fill-blue-500/20" />}
                      </h2>
                      
                      <p className="text-yellow-400 font-display font-bold text-sm tracking-widest mt-0.5">{selectedPlayer.clan}</p>
                      
                      {selectedPlayer.customTag && (
                          <div className="mt-2 bg-brand-500/10 border border-brand-500/20 px-3 py-0.5 rounded">
                              <span className="text-[10px] font-black text-brand-500 uppercase tracking-wider shadow-sm">{selectedPlayer.customTag}</span>
                          </div>
                      )}
                      
                      <div className="flex items-center gap-4 mt-6">
                          <button 
                             onClick={() => handleSocialAction('like')}
                             className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
                          >
                              <div className="w-10 h-10 rounded-full bg-brand-800 border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-red-500 group-hover:bg-red-500/10 transition-colors">
                                  <Heart size={18} className={localStorage.getItem('my_liked_users')?.includes(selectedPlayer.uid) ? 'fill-red-500 text-red-500' : ''} />
                              </div>
                              <span className="text-[10px] font-bold text-gray-400">{selectedPlayer.likes || 0}</span>
                          </button>
                          
                          <div className="flex flex-col items-center gap-1 group">
                              <div className={`w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-${selectedPlayer.activeBadge?.color || 'brand'}-500/10 text-${selectedPlayer.activeBadge?.color || 'brand'}-500`}>
                                  <Award size={18} />
                              </div>
                              <span className="text-[10px] font-bold text-gray-400 uppercase">{selectedPlayer.activeBadge?.name || 'No Badge'}</span>
                          </div>

                          <button 
                             onClick={() => {
                                 if(isFriend(selectedPlayer.uid)) {
                                     handleSocialAction('delete_friend');
                                 } else if (!isRequestSent(selectedPlayer.uid)) {
                                     handleSocialAction('friend');
                                 }
                             }}
                             className="flex flex-col items-center gap-1 group active:scale-90 transition-transform disabled:opacity-70"
                             disabled={isRequestSent(selectedPlayer.uid)}
                          >
                              <div className={`w-10 h-10 rounded-full border border-white/10 flex items-center justify-center transition-colors ${
                                  isFriend(selectedPlayer.uid) ? 'bg-green-500/20 text-green-500 border-green-500/30' : 
                                  isRequestSent(selectedPlayer.uid) ? 'bg-gray-700 text-gray-400' :
                                  'bg-brand-800 text-gray-400 group-hover:text-green-500 group-hover:bg-green-500/10'
                              }`}>
                                  {isFriend(selectedPlayer.uid) ? <Trash2 size={16}/> : isRequestSent(selectedPlayer.uid) ? <Check size={18}/> : <UserPlus size={18} />}
                              </div>
                              <span className={`text-[10px] font-bold ${isFriend(selectedPlayer.uid) ? 'text-green-500' : 'text-gray-400'}`}>
                                  {isFriend(selectedPlayer.uid) ? 'Remove' : isRequestSent(selectedPlayer.uid) ? 'Requested' : 'Add'}
                              </span>
                          </button>
                      </div>
                  </div>

                  {/* Advanced Stats Grid */}
                  <div className="px-6 grid grid-cols-2 gap-3 mb-6">
                      <Card className="bg-white/5 !p-3 border-white/5 flex flex-col items-center justify-center text-center">
                          <Crosshair size={20} className="text-brand-500 mb-1" />
                          <span className="text-xl sm:text-2xl font-display font-bold text-white">{selectedPlayer.kdRatio}</span>
                          <span className="text-[10px] text-gray-400 uppercase font-bold">K/D Ratio</span>
                      </Card>
                      <Card className="bg-white/5 !p-3 border-white/5 flex flex-col items-center justify-center text-center">
                          <Skull size={20} className="text-purple-500 mb-1" />
                          <span className="text-xl sm:text-2xl font-display font-bold text-white">{selectedPlayer.headshotRate}%</span>
                          <span className="text-[10px] text-gray-400 uppercase font-bold">Headshot %</span>
                      </Card>
                      <Card className="bg-white/5 !p-3 border-white/5 flex flex-col items-center justify-center text-center">
                          <Trophy size={20} className="text-yellow-500 mb-1" />
                          <span className="text-xl sm:text-2xl font-display font-bold text-white">{selectedPlayer.wins}</span>
                          <span className="text-[10px] text-gray-400 uppercase font-bold">Booyahs</span>
                      </Card>
                      <Card className="bg-white/5 !p-3 border-white/5 flex flex-col items-center justify-center text-center">
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
                          ) : (
                              <p className="text-xs text-gray-600 italic">No achievements unlocked yet.</p>
                          )}
                      </div>
                  </div>
              </div>
           </Modal>
        )}
      </div>
    </Layout>
  );
};

export default Leaderboard;
