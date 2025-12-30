import React from 'react';
import { Layout } from '../components/Layout';
import { LeaderboardEntry } from '../types';
import { Crown, Trophy, User } from 'lucide-react';

const Leaderboard: React.FC = () => {
  const topPlayers: LeaderboardEntry[] = [
    { uid: '1', name: 'RK_KILLER', earnings: 15000, matches: 45, wins: 12 },
    { uid: '2', name: 'Hydra_X', earnings: 12500, matches: 38, wins: 8 },
    { uid: '3', name: 'Ninja_007', earnings: 9800, matches: 50, wins: 5 },
    { uid: '4', name: 'Slayer_OP', earnings: 8000, matches: 20, wins: 6 },
    { uid: '5', name: 'Venom', earnings: 7500, matches: 25, wins: 4 },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-center py-4">
           <h2 className="text-2xl font-bold text-white">Top Players</h2>
           <p className="text-brand-gold text-sm font-medium">This Week's Champions</p>
        </div>

        {/* Top 3 Podium */}
        <div className="flex items-end justify-center gap-4 mb-8">
           {/* 2nd Place */}
           <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-2 border-gray-400 bg-gray-800 overflow-hidden mb-2">
                 <User size={64} className="text-gray-600 p-2" />
              </div>
              <div className="bg-gray-700 text-white text-xs font-bold px-2 py-0.5 rounded mb-1">#2</div>
              <p className="text-xs font-bold text-gray-300 w-20 text-center truncate">{topPlayers[1].name}</p>
              <p className="text-xs text-brand-gold font-bold">₹{topPlayers[1].earnings}</p>
              <div className="w-16 h-24 bg-gradient-to-t from-gray-800 to-gray-700 mt-2 rounded-t-lg"></div>
           </div>

           {/* 1st Place */}
           <div className="flex flex-col items-center -mb-4 z-10">
              <Crown size={24} className="text-yellow-500 mb-1 animate-bounce" />
              <div className="w-20 h-20 rounded-full border-2 border-yellow-500 bg-gray-800 overflow-hidden mb-2 shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                 <User size={80} className="text-gray-600 p-2" />
              </div>
              <div className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded mb-1">#1</div>
              <p className="text-sm font-bold text-white w-24 text-center truncate">{topPlayers[0].name}</p>
              <p className="text-xs text-brand-gold font-bold">₹{topPlayers[0].earnings}</p>
              <div className="w-20 h-32 bg-gradient-to-t from-yellow-600 to-yellow-500 mt-2 rounded-t-lg shadow-lg"></div>
           </div>

           {/* 3rd Place */}
           <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-2 border-orange-700 bg-gray-800 overflow-hidden mb-2">
                 <User size={64} className="text-gray-600 p-2" />
              </div>
              <div className="bg-orange-700 text-white text-xs font-bold px-2 py-0.5 rounded mb-1">#3</div>
              <p className="text-xs font-bold text-gray-300 w-20 text-center truncate">{topPlayers[2].name}</p>
              <p className="text-xs text-brand-gold font-bold">₹{topPlayers[2].earnings}</p>
              <div className="w-16 h-20 bg-gradient-to-t from-orange-900 to-orange-800 mt-2 rounded-t-lg"></div>
           </div>
        </div>

        {/* The Rest of the List */}
        <div className="bg-brand-800 rounded-xl border border-gray-700 overflow-hidden">
           {topPlayers.slice(3).map((player, idx) => (
             <div key={player.uid} className="flex items-center p-4 border-b border-gray-700 last:border-0 hover:bg-brand-700/50 transition-colors">
                <span className="w-8 font-bold text-gray-500">#{idx + 4}</span>
                <div className="w-10 h-10 bg-brand-900 rounded-full flex items-center justify-center mr-3">
                   <User size={20} className="text-gray-500" />
                </div>
                <div className="flex-1">
                   <p className="font-bold text-white">{player.name}</p>
                   <p className="text-xs text-gray-400">{player.wins} Wins • {player.matches} Matches</p>
                </div>
                <div className="text-right">
                   <p className="font-bold text-brand-gold">₹{player.earnings}</p>
                </div>
             </div>
           ))}
        </div>
      </div>
    </Layout>
  );
};

export default Leaderboard;