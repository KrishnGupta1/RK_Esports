import React from 'react';
import { Layout } from '../components/Layout';
import { Card, Badge, Button } from '../components/UI';
import { Users, Clock, Trophy, Map } from 'lucide-react';

const Tournaments: React.FC = () => {
  // Mock Data - In real app, fetch from Firestore 'tournaments' collection
  const tournaments = [
    {
      id: '1',
      title: 'Grand Battle Royale #01',
      map: 'Bermuda',
      type: 'Squad',
      entryFee: 100,
      prizePool: 2000,
      startTime: 'Today, 8:00 PM',
      slots: 12,
      joined: 8,
      status: 'open'
    },
    {
      id: '2',
      title: 'Solo Rush Hour',
      map: 'Purgatory',
      type: 'Solo',
      entryFee: 20,
      prizePool: 500,
      startTime: 'Today, 10:00 PM',
      slots: 48,
      joined: 48,
      status: 'full'
    },
    {
      id: '3',
      title: 'Duo Sniper Challenge',
      map: 'Kalahari',
      type: 'Duo',
      entryFee: 50,
      prizePool: 800,
      startTime: 'Tomorrow, 6:00 PM',
      slots: 24,
      joined: 5,
      status: 'open'
    }
  ];

  return (
    <Layout>
      <div className="space-y-4 pb-4">
        <h2 className="text-2xl font-bold text-white mb-4">Tournaments</h2>
        
        {tournaments.map((t) => (
          <Card key={t.id} className="relative overflow-hidden hover:border-brand-500/50 transition-colors">
            {t.status === 'full' && (
               <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10">
                 FULL
               </div>
            )}
            
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-lg text-white">{t.title}</h3>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                   <span className="flex items-center gap-1"><Map size={12}/> {t.map}</span>
                   <span className="flex items-center gap-1"><Users size={12}/> {t.type}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-brand-gold font-bold">
                  <Trophy size={14} />
                  <span>₹{t.prizePool}</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 mb-1">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Joined: {t.joined}/{t.slots}</span>
                <span className="text-brand-500">{t.status === 'open' ? 'Filling Fast' : 'Closed'}</span>
              </div>
              <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${t.status === 'full' ? 'bg-red-500' : 'bg-brand-500'}`} 
                  style={{ width: `${(t.joined / t.slots) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
               <div className="flex items-center gap-2 text-xs text-gray-300">
                 <Clock size={14} className="text-brand-500" />
                 {t.startTime}
               </div>
               <Button 
                 variant={t.status === 'full' ? 'secondary' : 'primary'} 
                 className="!w-auto !py-1.5 !px-4 text-sm"
                 disabled={t.status === 'full'}
               >
                 {t.status === 'full' ? 'Full' : `Join ₹${t.entryFee}`}
               </Button>
            </div>
          </Card>
        ))}
      </div>
    </Layout>
  );
};

export default Tournaments;