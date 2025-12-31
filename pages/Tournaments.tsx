
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card, Badge, Button } from '../components/UI';
import { 
  Users, Clock, Trophy, ChevronRight, X, Filter, 
  ShieldAlert, User, Send, Check, Monitor, Copy, Lock, Key, ChevronDown, ChevronUp, Eye
} from 'lucide-react';
import { Tournament } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const CountdownTimer: React.FC<{ targetDate: string }> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState<{h: number, m: number, s: number} | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          h: Math.floor((difference / (1000 * 60 * 60))),
          m: Math.floor((difference / 1000 / 60) % 60),
          s: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft(null);
      }
    };
    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <div className="flex gap-1 items-center font-mono text-xs text-brand-gold bg-black/40 px-2 py-0.5 rounded border border-white/5">
      <Clock size={10} className="mr-1" />
      <span>{String(timeLeft.h).padStart(2,'0')}h</span>:
      <span>{String(timeLeft.m).padStart(2,'0')}m</span>:
      <span>{String(timeLeft.s).padStart(2,'0')}s</span>
    </div>
  );
};

// --- PRIZE CHART COMPONENT ---
const PrizeChart: React.FC<{ data: { rank: number, amount: number }[] }> = ({ data }) => {
    const maxAmount = Math.max(...data.map(d => d.amount));
    return (
        <div className="flex items-end gap-3 h-32 pt-6 pb-2 px-2 overflow-x-auto no-scrollbar">
            {data.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1 group min-w-[48px]">
                    <span className="text-[10px] font-bold text-brand-gold opacity-0 group-hover:opacity-100 transition-opacity -mb-1">₹{item.amount}</span>
                    <div 
                        className={`w-full rounded-t-md relative transition-all duration-500 group-hover:brightness-110 ${
                            idx === 0 ? 'bg-gradient-to-t from-yellow-600 to-brand-gold w-12 shadow-[0_0_15px_rgba(255,215,0,0.3)]' : 
                            idx === 1 ? 'bg-gradient-to-t from-gray-700 to-gray-400 w-10' :
                            idx === 2 ? 'bg-gradient-to-t from-orange-800 to-orange-600 w-10' :
                            'bg-brand-800 w-8 border-t border-white/10'
                        }`}
                        style={{ height: `${(item.amount / maxAmount) * 100}%` }}
                    >
                    </div>
                    <div className="text-center">
                        <span className={`block text-[10px] font-black ${idx < 3 ? 'text-white' : 'text-gray-500'}`}>#{item.rank}</span>
                        <span className="block text-[9px] font-medium text-gray-400">₹{item.amount}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

// --- SKELETON LOADER ---
const TournamentSkeleton = () => (
    <div className="relative overflow-hidden rounded-2xl bg-[#0f0f11] shadow-lg">
        <div className="h-32 bg-gray-800/50 animate-pulse"></div>
        <div className="p-4 space-y-3">
            <div className="flex justify-between">
                <div className="h-4 w-16 bg-gray-800/50 rounded animate-pulse"></div>
                <div className="h-4 w-16 bg-gray-800/50 rounded animate-pulse"></div>
                <div className="h-4 w-16 bg-gray-800/50 rounded animate-pulse"></div>
            </div>
            <div className="h-2 w-full bg-gray-800/50 rounded animate-pulse"></div>
            <div className="h-8 w-full bg-gray-800/50 rounded animate-pulse"></div>
        </div>
    </div>
);

const Tournaments: React.FC = () => {
  const { tournaments, joinTournament, userProfile, refreshMatchData, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'live' | 'completed' | 'my_matches'>('upcoming');
  const [selectedMatch, setSelectedMatch] = useState<Tournament | null>(null);
  const [joinModalMatch, setJoinModalMatch] = useState<Tournament | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFormat, setFilterFormat] = useState<string>('All'); 
  const [joining, setJoining] = useState(false);
  
  // Advanced State
  const [joinType, setJoinType] = useState<'Solo' | 'Team'>('Solo');
  const [teamMembers, setTeamMembers] = useState<string[]>(['', '', '']); 
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null); 
  const [occupiedSlots, setOccupiedSlots] = useState<number[]>([]);
  const [matchDetailsTab, setMatchDetailsTab] = useState<'overview' | 'chat'>('overview');
  const [chatMsg, setChatMsg] = useState('');
  const [chatLog, setChatLog] = useState<{user: string, msg: string}[]>([]);
  
  // Collapsible Rules State
  const [expandedRules, setExpandedRules] = useState<string[]>([]);

  useEffect(() => {
     if(joinModalMatch) {
         const occupied = Array.from({length: Math.floor(joinModalMatch.slots * 0.7)}, () => Math.floor(Math.random() * joinModalMatch.slots) + 1);
         setOccupiedSlots(occupied);
     }
  }, [joinModalMatch]);

  const filteredTournaments = tournaments
    .filter(t => {
        let matchesTab = false;
        if (activeTab === 'my_matches') {
            matchesTab = !!t.isJoined;
        } else {
            matchesTab = 
                (activeTab === 'upcoming' && t.status === 'open') ||
                (activeTab === 'live' && t.status === 'ongoing') ||
                (activeTab === 'completed' && t.status === 'completed');
        }
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.map.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFormat = filterFormat === 'All' || t.type === filterFormat;
        return matchesTab && matchesSearch && matchesFormat;
    });

  const toggleRules = (id: string) => {
    setExpandedRules(prev => 
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleConfirmJoin = async () => {
    if (!joinModalMatch) return;
    
    if (joinType === 'Team') {
        const filled = teamMembers.filter(n => n.trim().length > 2);
        const required = joinModalMatch.type === 'Squad' ? 3 : 1; 
        if (filled.length < required) {
            alert(`Please enter valid names for all teammates.`);
            return;
        }
    }

    if (!selectedSlot || occupiedSlots.includes(selectedSlot)) {
        alert("Please select a valid slot.");
        return;
    }

    setJoining(true);
    const result = await joinTournament(joinModalMatch.id, joinType, joinType === 'Team' ? teamMembers : [], selectedSlot);
    setJoining(false);

    if (result.success) {
      setJoinModalMatch(null); 
      const updatedMatch = tournaments.find(t => t.id === joinModalMatch.id);
      if (updatedMatch) setSelectedMatch(updatedMatch);
      setTeamMembers(['', '', '']);
      setJoinType('Solo');
      setSelectedSlot(null);
    } else {
      alert(result.message);
    }
  };

  const handleSendChat = () => {
      if(!chatMsg.trim()) return;
      setChatLog(prev => [...prev, { user: userProfile?.name || 'You', msg: chatMsg }]);
      setChatMsg('');
  };

  const handleCopy = (text: string, e: React.MouseEvent) => {
      e.stopPropagation();
      navigator.clipboard.writeText(text);
      if(navigator.vibrate) navigator.vibrate(50);
  };

  const handleSpectate = (link: string, e: React.MouseEvent) => {
      e.stopPropagation();
      window.open(link, '_blank');
  }

  const formats = [
      { id: 'All', label: 'All', icon: <Filter size={14} /> },
      { id: 'Solo', label: 'Solo', icon: <User size={14} /> },
      { id: 'Duo', label: 'Duo', icon: <Users size={14} /> },
      { id: 'Squad', label: 'Squad', icon: <Users size={14} /> },
  ];

  return (
    <Layout>
      <div className="space-y-6 pb-4">
        
        {/* Header */}
        <div className="flex items-center justify-between">
           <h2 className="text-2xl font-display font-bold text-white tracking-wide">ARENA</h2>
           {activeTab === 'live' && (
             <div className="bg-red-500/10 px-3 py-1 rounded-full border border-red-500/30 flex items-center gap-2 animate-pulse">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span className="text-[10px] font-bold text-red-500 tracking-wider">LIVE</span>
             </div>
           )}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col gap-4">
             {/* Search */}
             <div className="relative flex-1">
                <input 
                   className="w-full bg-brand-900 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:border-brand-500/50 outline-none placeholder-gray-600"
                   placeholder="Search maps or tournaments..."
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                />
             </div>
             
             {/* Format Chips - Scrollable Horizontal */}
             <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {formats.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterFormat(f.id)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border transition-all flex items-center gap-2 active:scale-95 ${
                    filterFormat === f.id ? 'bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/20' : 'bg-brand-900/50 text-gray-400 border-gray-700'
                  }`}
                >
                  {f.icon} {f.label}
                </button>
              ))}
            </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 overflow-x-auto p-1 bg-black/40 rounded-xl border border-white/5 no-scrollbar">
          {['upcoming', 'live', 'completed', 'my_matches'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-2.5 px-3 text-[10px] font-bold uppercase rounded-lg whitespace-nowrap transition-colors active:scale-95 ${
                activeTab === tab ? 'bg-brand-700 text-white shadow-lg' : 'text-gray-500 hover:bg-white/5'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Tournament Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[50vh]">
          {loading ? (
             <>
               <TournamentSkeleton />
               <TournamentSkeleton />
               <TournamentSkeleton />
             </>
          ) : filteredTournaments.length === 0 ? (
            <div className="col-span-full text-center py-20 text-gray-500">
              <Filter size={32} className="opacity-20 mx-auto mb-2" />
              <p>No matches found.</p>
            </div>
          ) : (
             filteredTournaments.map((t, index) => (
               <motion.div
                 key={t.id}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: index * 0.05 }}
               >
                 <Card className={`relative overflow-hidden group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-500/10 !p-0 shadow-lg bg-[#0f0f11] h-full flex flex-col border border-white/5 ${t.isJoined ? 'border-brand-500/50' : ''}`}>
                    
                    {/* Image Section */}
                    <div className="h-32 relative overflow-hidden" onClick={() => setSelectedMatch(t)}>
                        <img src={t.image} alt={t.map} className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f11] via-[#0f0f11]/60 to-transparent"></div>
                        
                        <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                            {t.isJoined && <span className="bg-green-500 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase shadow-lg">JOINED</span>}
                            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase border bg-black/40 backdrop-blur border-white/10">{t.difficulty}</span>
                        </div>

                        <div className="absolute bottom-2 left-4 right-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Badge color="yellow">{t.gameMode}</Badge>
                                {/* Live Status or Countdown */}
                                {t.status === 'ongoing' ? (
                                    <div className="flex items-center gap-1 bg-red-500 text-white px-2 py-0.5 rounded text-[9px] font-bold animate-pulse shadow-lg shadow-red-500/20">
                                        <span className="w-1.5 h-1.5 bg-white rounded-full"></span> LIVE
                                    </div>
                                ) : (
                                    <CountdownTimer targetDate={t.startTime} />
                                )}
                            </div>
                            <h3 className="font-display font-bold text-lg text-white truncate">{t.title}</h3>
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div onClick={() => setSelectedMatch(t)} className="p-4 bg-[#0f0f11] flex-1 flex flex-col">
                       
                       {/* ROOM DETAILS (Visible only if joined) */}
                       {t.isJoined && (
                            <div className="bg-brand-900/80 rounded-lg p-2 mb-3 border border-brand-500/20 shadow-inner relative overflow-hidden">
                                {t.roomId ? (
                                    <div className="flex items-center justify-between gap-2 relative z-10">
                                        {/* Room ID */}
                                        <div className="flex-1 bg-black/40 p-2 rounded border border-white/5 flex items-center justify-between group/id hover:border-brand-500/30 transition-colors">
                                            <div className="min-w-0">
                                                <span className="text-[9px] text-gray-500 uppercase font-bold block flex items-center gap-1"><Monitor size={8} /> Room ID</span>
                                                <span className="text-xs font-mono font-bold text-white tracking-widest truncate block">{t.roomId}</span>
                                            </div>
                                            <button 
                                                onClick={(e) => handleCopy(t.roomId || '', e)} 
                                                className="text-gray-500 hover:text-white bg-white/5 hover:bg-brand-500 p-1.5 rounded transition-colors"
                                            >
                                                <Copy size={12}/>
                                            </button>
                                        </div>
                                        {/* Password */}
                                        <div className="flex-1 bg-black/40 p-2 rounded border border-white/5 flex items-center justify-between group/pass hover:border-brand-500/30 transition-colors">
                                            <div className="min-w-0">
                                                <span className="text-[9px] text-gray-500 uppercase font-bold block flex items-center gap-1"><Key size={8} /> Pass</span>
                                                <span className="text-xs font-mono font-bold text-white tracking-widest truncate block">{t.roomPassword || '---'}</span>
                                            </div>
                                            <button 
                                                onClick={(e) => handleCopy(t.roomPassword || '', e)} 
                                                className="text-gray-500 hover:text-white bg-white/5 hover:bg-brand-500 p-1.5 rounded transition-colors"
                                            >
                                                <Copy size={12}/>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-2 text-center relative z-10">
                                        <div className="flex justify-center mb-1"><Clock size={16} className="text-yellow-500 animate-spin-slow" /></div>
                                        <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider animate-pulse">Waiting for Host...</p>
                                        <p className="text-[9px] text-gray-500">Details shared 15m before start</p>
                                    </div>
                                )}
                                {/* Decorative Glow */}
                                <div className="absolute top-0 right-0 w-20 h-20 bg-brand-500/5 rounded-full blur-xl pointer-events-none"></div>
                            </div>
                       )}

                       <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                           <div className="text-center"><p className="text-[9px] text-gray-500 uppercase font-bold">Pool</p><p className="text-brand-gold font-bold">₹{t.prizePool}</p></div>
                           <div className="text-center"><p className="text-[9px] text-gray-500 uppercase font-bold">Kill</p><p className="text-white font-bold">₹{t.perKill}</p></div>
                           <div className="text-center"><p className="text-[9px] text-gray-500 uppercase font-bold">Entry</p><p className="text-brand-500 font-bold">₹{t.entryFee}</p></div>
                       </div>
                       
                       <div className="flex items-end justify-between gap-4 mt-auto">
                           <div className="flex-1">
                               <div className="flex justify-between text-[9px] font-bold mb-1">
                                   <span className={t.joined >= t.slots ? 'text-red-500' : 'text-gray-400'}>{t.joined}/{t.slots} Joined</span>
                                </div>
                               <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                   <div className="h-full bg-brand-500 transition-all duration-500" style={{ width: `${(t.joined / t.slots) * 100}%` }}></div>
                               </div>
                           </div>
                           <div className="w-24">
                               {t.status === 'ongoing' ? (
                                    <button 
                                        onClick={(e) => handleSpectate(t.spectateLink || 'https://youtube.com', e)}
                                        className="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-[10px] font-bold shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-1 active:scale-95"
                                    >
                                        <Eye size={12} /> WATCH
                                    </button>
                               ) : t.isJoined ? (
                                   <button className="w-full py-2 bg-green-500/10 border border-green-500/30 text-green-500 rounded-lg text-[10px] font-bold transition-colors hover:bg-green-500/20">DETAILS</button>
                               ) : (
                                   <button 
                                      onClick={(e) => { e.stopPropagation(); setJoinModalMatch(t); }}
                                      className="w-full py-2 bg-brand-500 hover:bg-brand-400 text-white rounded-lg text-[10px] font-bold shadow-lg shadow-brand-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                      disabled={t.joined >= t.slots || t.status !== 'open'}
                                   >
                                      {t.joined >= t.slots ? 'FULL' : 'JOIN'}
                                   </button>
                               )}
                           </div>
                       </div>
                    </div>
                 </Card>
               </motion.div>
             ))
          )}
        </div>

        {/* --- DETAILS MODAL (SAFE SCROLL FIX) --- */}
        <AnimatePresence>
          {selectedMatch && (
            <div className="fixed inset-0 z-[80] flex items-end md:items-center justify-center p-0 md:p-4">
               {/* Backdrop */}
               <motion.div 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 exit={{ opacity: 0 }}
                 className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                 onClick={() => setSelectedMatch(null)}
               ></motion.div>
               
               {/* Modal Content - Flex Column Structure */}
               <motion.div 
                 initial={{ y: "100%" }}
                 animate={{ y: 0 }}
                 exit={{ y: "100%" }}
                 transition={{ type: "spring", damping: 25, stiffness: 300 }}
                 className="bg-brand-950/95 w-full md:max-w-4xl rounded-t-[2rem] md:rounded-2xl flex flex-col h-[92dvh] md:h-[85vh] border-t md:border border-white/10 relative z-10 shadow-2xl overflow-hidden"
               >
                   {/* Mobile Handle */}
                   <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto mt-3 mb-1 md:hidden shrink-0"></div>

                   {/* Header (Fixed) */}
                   <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-brand-900/50 shrink-0">
                      <h2 className="font-bold text-white truncate max-w-[200px] md:max-w-none text-lg">{selectedMatch.title}</h2>
                      <button onClick={() => setSelectedMatch(null)} className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-full transition-colors"><X size={18} /></button>
                   </div>

                   {/* DETAILS TABS (Fixed) */}
                   {selectedMatch.isJoined && (
                       <div className="flex border-b border-white/5 bg-black/20 shrink-0">
                           <button onClick={() => setMatchDetailsTab('overview')} className={`flex-1 py-4 text-xs font-bold uppercase ${matchDetailsTab === 'overview' ? 'text-brand-500 border-b-2 border-brand-500' : 'text-gray-500 hover:text-gray-300'}`}>Overview</button>
                           <button onClick={() => setMatchDetailsTab('chat')} className={`flex-1 py-4 text-xs font-bold uppercase ${matchDetailsTab === 'chat' ? 'text-brand-500 border-b-2 border-brand-500' : 'text-gray-500 hover:text-gray-300'}`}>Squad Chat</button>
                       </div>
                   )}

                   {/* Scrollable Content (Takes Remaining Space) */}
                   <div className="flex-1 overflow-y-auto p-5 pb-8 no-scrollbar">
                       {matchDetailsTab === 'overview' ? (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div className="space-y-6">
                                   {/* Hero Banner in Modal */}
                                   <div className="relative h-44 rounded-2xl overflow-hidden shadow-lg border border-white/10 group">
                                        <img src={selectedMatch.image} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" alt="" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/20 to-transparent"></div>
                                        <div className="absolute bottom-3 left-4 right-4">
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <div className="flex gap-2 mb-2">
                                                        <Badge color="yellow">{selectedMatch.gameMode}</Badge>
                                                        <Badge color="blue">{selectedMatch.map}</Badge>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-gray-300 font-medium">
                                                        <span className="flex items-center gap-1"><Users size={12} className="text-brand-500"/> {selectedMatch.type}</span>
                                                        <span className="text-gray-600">|</span>
                                                        <span className="flex items-center gap-1"><Monitor size={12} className="text-purple-500"/> {selectedMatch.deviceRestriction || 'Mobile'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                   </div>

                                   {/* Stats Grid */}
                                   <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-brand-gold/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <p className="text-[10px] text-gray-500 uppercase font-bold relative z-10">Prize Pool</p>
                                            <p className="text-brand-gold font-display font-black text-lg relative z-10">₹{selectedMatch.prizePool}</p>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold">Per Kill</p>
                                            <p className="text-white font-display font-bold text-lg">₹{selectedMatch.perKill}</p>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold">Entry Fee</p>
                                            <p className="text-brand-500 font-display font-bold text-lg">₹{selectedMatch.entryFee}</p>
                                        </div>
                                   </div>
                               </div>

                               <div className="space-y-6">
                                   {/* Prize Distribution */}
                                   <div className="bg-brand-900/50 rounded-xl border border-white/5 p-5 relative overflow-hidden">
                                        <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                                           <Trophy size={14} className="text-brand-gold"/> Prize Pool Distribution
                                        </h4>
                                        <div className="bg-black/20 rounded-xl p-2 mb-4 border border-white/5">
                                            <PrizeChart data={selectedMatch.prizeDistribution} />
                                        </div>
                                   </div>

                                   {/* Rules */}
                                   <div className="bg-red-500/5 rounded-xl border border-red-500/10 p-5">
                                        <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <ShieldAlert size={14} /> Match Rules
                                        </h4>
                                        <div className="space-y-3">
                                            {selectedMatch.rules.map((rule, i) => (
                                                <div key={i} className="flex gap-3 text-xs text-gray-300 bg-red-500/5 p-2 rounded border border-red-500/5">
                                                    <div className="bg-red-500/20 p-1 rounded h-fit mt-0.5">
                                                        <Check size={10} className="text-red-500" />
                                                    </div>
                                                    <span className="leading-relaxed">{rule}</span>
                                                </div>
                                            ))}
                                        </div>
                                   </div>
                               </div>
                           </div>
                       ) : (
                           // CHAT TAB
                           <div className="h-full flex flex-col">
                               <div className="flex-1 space-y-3 mb-4 overflow-y-auto pr-2">
                                   {chatLog.length === 0 && <p className="text-center text-gray-500 text-xs mt-10 italic">Start discussing strategy with your squad...</p>}
                                   {chatLog.map((c, i) => (
                                       <div key={i} className={`flex flex-col ${c.user === 'You' ? 'items-end' : 'items-start'}`}>
                                           <span className="text-[9px] text-gray-500 mb-0.5 ml-1">{c.user}</span>
                                           <div className={`px-3 py-2 rounded-2xl text-xs max-w-[80%] shadow-md ${c.user === 'You' ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-gray-800 text-gray-200 rounded-tl-none'}`}>
                                               {c.msg}
                                           </div>
                                       </div>
                                   ))}
                               </div>
                               <div className="flex gap-2 bg-brand-900/50 p-1 rounded-xl border border-white/10">
                                   <input 
                                      className="flex-1 bg-transparent border-none rounded-lg px-3 py-2 text-xs text-white outline-none placeholder-gray-500" 
                                      placeholder="Type message..."
                                      value={chatMsg}
                                      onChange={e => setChatMsg(e.target.value)}
                                   />
                                   <button onClick={handleSendChat} className="bg-brand-500 w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-lg shadow-brand-500/20"><Send size={14}/></button>
                               </div>
                           </div>
                       )}
                   </div>

                   {/* Footer Action - LIFTED UP with pb-safe + extra padding */}
                   {!selectedMatch.isJoined && (
                      <div className="p-4 border-t border-white/10 bg-brand-900 shrink-0 z-20 pb-28">
                          <Button onClick={() => setJoinModalMatch(selectedMatch)} className="w-full text-lg shadow-xl h-14">JOIN MATCH - ₹{selectedMatch.entryFee}</Button>
                      </div>
                   )}
               </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- JOIN MODAL (SAFE SCROLL FIX) --- */}
        <AnimatePresence>
            {joinModalMatch && (
                <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => setJoinModalMatch(null)}
                    />
                    
                    <motion.div 
                         initial={{ y: "100%" }}
                         animate={{ y: 0 }}
                         exit={{ y: "100%" }}
                         transition={{ type: "spring", damping: 25, stiffness: 300 }}
                         // INCREASED HEIGHT HERE: h-[100dvh] instead of 85dvh
                         className="bg-brand-950 w-full sm:max-w-md rounded-t-[2rem] sm:rounded-2xl border-t sm:border border-white/10 shadow-2xl relative flex flex-col h-[100dvh] sm:max-h-[85vh]"
                    >
                        {/* Header Section (Fixed) */}
                        <div className="p-6 pb-2 shrink-0">
                             <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto mb-4 sm:hidden"></div>
                             <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white">Select Slot</h3>
                                <button onClick={() => setJoinModalMatch(null)} className="text-gray-400 hover:text-white"><X size={20}/></button>
                             </div>
                        </div>
                        
                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto no-scrollbar p-6 pt-2">
                             <div className="bg-black/30 p-3 rounded-xl border border-white/5 min-h-[200px]">
                                 <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                                    {Array.from({length: joinModalMatch.slots}).map((_, i) => (
                                        <button 
                                        key={i} 
                                        onClick={() => setSelectedSlot(i+1)}
                                        disabled={occupiedSlots.includes(i+1)}
                                        className={`p-1 rounded-lg text-xs font-bold transition-all h-10 border ${selectedSlot === i+1 ? 'bg-brand-500 text-white scale-110 shadow-lg border-brand-400' : occupiedSlots.includes(i+1) ? 'bg-red-500/10 text-red-900 border-red-500/20 cursor-not-allowed opacity-50' : 'bg-gray-800 text-gray-400 border-white/5 hover:bg-gray-700 hover:text-white'}`}
                                        >
                                            {i+1}
                                        </button>
                                    ))}
                                 </div>
                             </div>
                             
                             {joinType === 'Team' && (
                                <div className="mt-4 space-y-2">
                                    <p className="text-xs font-bold text-gray-400 uppercase">Teammate Names</p>
                                    {teamMembers.map((member, i) => (
                                        <input 
                                            key={i}
                                            value={member}
                                            onChange={(e) => {
                                                const newMembers = [...teamMembers];
                                                newMembers[i] = e.target.value;
                                                setTeamMembers(newMembers);
                                            }}
                                            placeholder={`Player ${i+2} Name`}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-500/50 outline-none"
                                        />
                                    ))}
                                </div>
                             )}
                        </div>
                        
                        {/* Footer (Fixed) - Lifted Up */}
                        <div className="p-6 border-t border-white/10 bg-brand-950 shrink-0 pb-20">
                            <div className="flex gap-2">
                                <Button variant="secondary" onClick={() => setJoinModalMatch(null)}>Cancel</Button>
                                <Button onClick={handleConfirmJoin} disabled={joining}>{joining ? 'Joining...' : 'Confirm'}</Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default Tournaments;
