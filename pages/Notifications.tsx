import React from 'react';
import { Layout } from '../components/Layout';
import { Bell, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { Notification } from '../types';

const Notifications: React.FC = () => {
  const notifications: Notification[] = [
    {
      id: '1',
      title: 'Room ID Updated',
      message: 'Room ID for Match #42 has been updated. Check details now.',
      date: '10 mins ago',
      read: false,
      type: 'success'
    },
    {
      id: '2',
      title: 'Welcome to RK Esports',
      message: 'Complete your profile to join your first tournament.',
      date: '2 hours ago',
      read: true,
      type: 'info'
    },
    {
      id: '3',
      title: 'Maintenance Alert',
      message: 'Servers will be down for 30 mins tonight at 2 AM.',
      date: '1 day ago',
      read: true,
      type: 'warning'
    }
  ];

  return (
    <Layout>
       <div className="space-y-4">
         <h2 className="text-2xl font-bold text-white">Notifications</h2>
         
         <div className="space-y-3">
           {notifications.map((n) => (
             <div key={n.id} className={`p-4 rounded-xl border flex gap-4 ${
               n.read ? 'bg-brand-800 border-gray-700' : 'bg-brand-800/80 border-brand-500/30 relative overflow-hidden'
             }`}>
               {/* Unread Indicator */}
               {!n.read && <div className="absolute top-0 right-0 w-3 h-3 bg-brand-500 rounded-bl-lg"></div>}

               <div className={`shrink-0 mt-1`}>
                 {n.type === 'success' && <div className="p-2 bg-green-500/10 rounded-lg text-green-500"><CheckCircle size={20} /></div>}
                 {n.type === 'info' && <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Info size={20} /></div>}
                 {n.type === 'warning' && <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500"><AlertTriangle size={20} /></div>}
               </div>

               <div>
                 <h3 className={`font-bold text-sm ${n.read ? 'text-gray-300' : 'text-white'}`}>{n.title}</h3>
                 <p className="text-xs text-gray-400 mt-1 leading-relaxed">{n.message}</p>
                 <p className="text-[10px] text-gray-500 mt-2">{n.date}</p>
               </div>
             </div>
           ))}
         </div>
       </div>
    </Layout>
  );
};

export default Notifications;