import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, Badge, Button } from '../components/UI';
import { Users, Clock, Trophy, Map, ChevronRight, X, AlertTriangle, Crosshair, Lock, Copy } from 'lucide-react';
import { Tournament } from '../types';
import { AnimatePresence, motion } from 'framer-motion';

const Tournaments: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'live' | 'completed'>('upcoming');
  const [selectedMatch, setSelectedMatch] = useState<Tournament | null>(null);

  // Mock Data 
  const tournaments: Tournament[] = [
    {
      id: '1',
      title: 'Grand Battle Royale #01',
      map: 'Bermuda',
      type: 'Squad',
      entryFee: 100,
      prizePool: 2000,
      startTime: 'Today, 8:00 PM',
      status: 'open',
      joined: 8,
      slots: 48,
      perKill: 20,
      rules: ['No Hacking/Scripting', 'Teaming not allowed', 'Emulator not allowed', 'Wait for Room ID'],
      prizeDistribution: [{ rank: 1, amount: 1000 }, { rank: 2, amount: 600 }, { rank: 3, amount: 400 }],
      isJoined: true
    },
    {
      id: '2',
      title: 'Solo Rush Hour',
      map: 'Purgatory',
      type: 'Solo',
      entryFee: 20,
      prizePool: 500,
      startTime: 'Today, 10:00 PM',
      status: 'ongoing',
      joined: 48,
      slots: 48,
      perKill: 10,
      rules: ['Standard BR Rules', 'Mobile Only'],
      prizeDistribution: [{ rank: 1, amount: 300 }, { rank: 2, amount: 150 }, { rank: 3, amount: 50 }],
      roomId: '12345678',
      roomPassword: '123',
      isJoined: true
    },
    {
      id: '3',
      title: 'Duo Sniper Challenge',
      map: 'Kalahari',
      type: 'Duo',
      entryFee: 50,
      prizePool: 800,
      startTime: 'Tomorrow, 6:00 PM',
      status: 'open',
      joined: 5,
      slots: 24,
      perKill: 15,
      rules: ['Snipers Only', 'No Grenades'],
      prizeDistribution: [{ rank: 1, amount: 500 }, { rank: 2, amount: 300 }],
      isJoined: false
    }
  ];

  // Filter logic
  const filteredTournaments = tournaments.filter(t => {
    if (activeTab === 'upcoming') return t.status === 'open';
    if (activeTab === 'live') return t.status === 'ongoing';
    return t.status === 'completed';
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied!');
  };

  return (
    <Layout>
      <div className="space-y-4 pb-4">
        <h2 className="text-2xl font-bold text-white mb-2">Matches</h2>
        
        {/* Tabs */}
        <div className="flex p-1 bg-brand-800 rounded-xl mb-4 border border-gray-700">
          {['upcoming', 'live', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg capitalize transition-all ${
                activeTab === tab 
                  ? 'bg-brand-500 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-4">
          {filteredTournaments.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No {activeTab} matches found.
            </div>
          )}

          {filteredTournaments.map((t) => (
            <Card key={t.id} className="relative overflow-hidden group cursor-pointer border-gray-700 hover:border-brand-500/50 transition-all">
               <div onClick={() => setSelectedMatch(t)}>
                {/* Status Badge */}
                <div className="absolute top-0 right-0">
                   <div className={`text-[10px] font-bold px-3 py-1 rounded-bl-xl ${
                     t.status === 'ongoing' ? 'bg-red-600 animate-pulse text-white' : 
                     t.isJoined ? 'bg-green-600 text-white' : 'bg-brand-800 border-l border-b border-gray-600 text-gray-400'
                   }`}>
                     {t.status === 'ongoing' ? 'LIVE NOW' : t.isJoined ? 'JOINED' : t.slots - t.joined + ' Slots Left'}
                   </div>
                </div>

                {/* Main Content */}
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden relative">
                    <img src={`https://picsum.photos/seed/${t.id}/200`} alt="Map" className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <Map size={24} className="text-white drop-shadow-lg" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0 pt-1">
                    <h3 className="font-bold text-lg text-white truncate pr-16">{t.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                      <span className="flex items-center gap-1 text-brand-400"><Clock size={12}/> {t.startTime}</span>
                      <span className="flex items-center gap-1"><Users size={12}/> {t.type}</span>
                    </div>
                    
                    {/* Prize & Fee Row */}
                    <div className="flex items-center justify-between mt-3">
                       <div className="bg-brand-900/50 px-2 py-1 rounded border border-gray-700 flex items-center gap-1">
                         <span className="text-[10px] text-gray-400 uppercase">Prize</span>
                         <span className="text-sm font-bold text-brand-gold">₹{t.prizePool}</span>
                       </div>
                       
                       <div className="flex items-center gap-2">
                         <span className="text-[10px] text-gray-500">Per Kill: <span className="text-gray-300">₹{t.perKill}</span></span>
                         <Button 
                            variant={t.isJoined ? 'secondary' : 'primary'} 
                            className="!w-auto !py-1.5 !px-4 text-xs h-8"
                          >
                            {t.isJoined ? 'View' : `Join ₹${t.entryFee}`}
                         </Button>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-3">
                  <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500" style={{ width: `${(t.joined / t.slots) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </Card>
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
              className="fixed inset-0 z-[60] bg-brand-900 flex flex-col"
            >
              {/* Header */}
              <div className="h-16 bg-brand-800 border-b border-gray-700 flex items-center justify-between px-4 shrink-0">
                 <button onClick={() => setSelectedMatch(null)} className="p-2 -ml-2 text-gray-400 hover:text-white">
                   <ChevronRight size={24} className="rotate-180" />
                 </button>
                 <h2 className="font-bold text-white truncate max-w-[200px]">{selectedMatch.title}</h2>
                 <button onClick={() => setSelectedMatch(null)} className="p-2 -mr-2 text-gray-400 hover:text-white">
                   <X size={24} />
                 </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                
                {/* Room ID Section (Only if joined) */}
                {selectedMatch.isJoined && (
                  <div className="bg-gradient-to-r from-blue-900/40 to-blue-800/40 border border-blue-500/30 rounded-xl p-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                      <Lock size={80} />
                    </div>
                    <h3 className="text-blue-400 font-bold flex items-center gap-2 mb-3">
                      <Lock size={18} /> Room Details
                    </h3>
                    
                    {selectedMatch.roomId ? (
                      <div className="grid grid-cols-2 gap-4 relative z-10">
                        <div className="bg-brand-900/80 p-3 rounded-lg border border-blue-500/30">
                          <p className="text-xs text-blue-300 mb-1">Room ID</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-mono font-bold text-white">{selectedMatch.roomId}</span>
                            <button onClick={() => copyToClipboard(selectedMatch.roomId!)} className="text-blue-400 hover:text-white">
                              <Copy size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="bg-brand-900/80 p-3 rounded-lg border border-blue-500/30">
                          <p className="text-xs text-blue-300 mb-1">Password</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-mono font-bold text-white">{selectedMatch.roomPassword}</span>
                            <button onClick={() => copyToClipboard(selectedMatch.roomPassword!)} className="text-blue-400 hover:text-white">
                              <Copy size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 bg-brand-900/50 rounded-lg border border-dashed border-blue-500/30">
                        <p className="text-blue-200 text-sm font-medium">Room ID & Pass will be updated here</p>
                        <p className="text-blue-400/60 text-xs mt-1">10-15 mins before match start</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-brand-800 p-3 rounded-xl border border-gray-700 flex items-center gap-3">
                    <div className="bg-orange-500/10 p-2 rounded-lg text-orange-500"><Trophy size={20} /></div>
                    <div>
                      <p className="text-xs text-gray-500">Prize Pool</p>
                      <p className="text-lg font-bold text-white">₹{selectedMatch.prizePool}</p>
                    </div>
                  </div>
                  <div className="bg-brand-800 p-3 rounded-xl border border-gray-700 flex items-center gap-3">
                    <div className="bg-red-500/10 p-2 rounded-lg text-red-500"><Crosshair size={20} /></div>
                    <div>
                      <p className="text-xs text-gray-500">Per Kill</p>
                      <p className="text-lg font-bold text-white">₹{selectedMatch.perKill}</p>
                    </div>
                  </div>
                </div>

                {/* Prize Breakdown */}
                <div>
                   <h3 className="font-bold text-white mb-3 flex items-center gap-2">Prize Distribution</h3>
                   <div className="bg-brand-800 rounded-xl border border-gray-700 overflow-hidden">
                      {selectedMatch.prizeDistribution.map((prize, idx) => (
                        <div key={idx} className="flex justify-between items-center px-4 py-3 border-b border-gray-700 last:border-0">
                           <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                idx === 0 ? 'bg-yellow-500 text-black' : 
                                idx === 1 ? 'bg-gray-400 text-black' :
                                idx === 2 ? 'bg-orange-700 text-white' : 'bg-brand-700 text-gray-400'
                              }`}>#{prize.rank}</div>
                              <span className="text-gray-300 text-sm">Winner Rank {prize.rank}</span>
                           </div>
                           <span className="font-bold text-brand-gold">₹{prize.amount}</span>
                        </div>
                      ))}
                   </div>
                </div>

                {/* Rules */}
                <div>
                   <h3 className="font-bold text-white mb-3">Match Rules</h3>
                   <div className="bg-brand-800 rounded-xl border border-gray-700 p-4">
                      <ul className="space-y-2">
                        {selectedMatch.rules.map((rule, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-400">
                            <span className="text-brand-500 mt-1">•</span>
                            {rule}
                          </li>
                        ))}
                      </ul>
                   </div>
                </div>

                {/* Spacer for bottom bar */}
                <div className="h-20"></div>
              </div>

              {/* Bottom Action Bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-brand-800 border-t border-gray-700 p-4 safe-area-bottom">
                 {selectedMatch.isJoined ? (
                    <Button disabled className="bg-green-600/20 text-green-500 border border-green-500/50">
                       ALREADY JOINED
                    </Button>
                 ) : (
                    <Button>
                       Join Match • ₹{selectedMatch.entryFee}
                    </Button>
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