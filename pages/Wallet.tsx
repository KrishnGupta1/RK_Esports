import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, Button } from '../components/UI';
import { useAuth } from '../contexts/AuthContext';
import { History, TrendingUp, TrendingDown, AlertCircle, Plus, ArrowDownLeft, X, Headset } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Wallet: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState<'add' | 'withdraw' | null>(null);

  // Mock Transactions
  const transactions = [
    { id: '1', type: 'credit', amount: 100, desc: 'Welcome Bonus', date: '2023-10-25' },
    // { id: '2', type: 'debit', amount: 50, desc: 'Joined Match #42', date: '2023-10-26' }
  ];

  const handleContactSupport = () => {
    navigate('/support');
    setShowModal(null);
  };

  return (
    <Layout>
      {/* Modal for Actions */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-300">
          <div className="w-full max-w-sm bg-brand-800 border border-gray-700 rounded-2xl p-6 relative shadow-2xl transform scale-100 transition-transform">
            <button 
              onClick={() => setShowModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${showModal === 'add' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                <Headset size={32} />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">
                {showModal === 'add' ? 'Contact Admin to Add' : 'Request Withdrawal'}
              </h3>
              
              <div className="bg-brand-900 rounded-lg p-3 mb-6 border border-gray-700">
                <p className="text-gray-300 text-sm leading-relaxed">
                  {showModal === 'add' 
                    ? "Coins are added manually by the Admin. Please contact support or send a WhatsApp message to proceed." 
                    : "Withdrawals are processed manually. Please create a support ticket with your UPI/Bank details."}
                </p>
              </div>
              
              <div className="flex flex-col gap-3">
                 <Button onClick={handleContactSupport} className="flex items-center justify-center gap-2">
                   <Headset size={18} />
                   Go to Support
                 </Button>
                 <Button variant="secondary" onClick={() => setShowModal(null)}>
                   Cancel
                 </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">My Wallet</h2>

        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-brand-900 to-brand-800 border-brand-500/30 relative overflow-hidden">
           {/* Decorative Background */}
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-gold/10 rounded-full blur-3xl"></div>
           <div className="absolute top-0 right-0 p-4 opacity-5">
              <TrendingUp size={120} className="text-white" />
           </div>

          <div className="text-center py-6 relative z-10">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Total Balance</p>
            <h1 className="text-5xl font-black text-brand-gold tracking-tighter drop-shadow-sm flex items-center justify-center gap-1">
              <span className="text-3xl opacity-50">₹</span>{userProfile?.coins || 0}
            </h1>
            <p className="text-gray-500 text-xs mt-2 font-medium">Available to play</p>
          </div>
        </Card>

        {/* Visually Distinct Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setShowModal('add')}
            className="group relative overflow-hidden bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-xl p-4 flex flex-col items-center justify-center gap-2 shadow-lg shadow-green-900/20 active:scale-95 transition-all duration-200"
          >
            <div className="bg-white/20 p-2 rounded-full group-hover:rotate-90 transition-transform duration-300">
              <Plus size={24} />
            </div>
            <div className="text-center">
              <span className="block font-bold text-lg leading-tight">Add Coins</span>
              <span className="text-[10px] text-green-100/70 uppercase tracking-wider font-medium">Contact Admin</span>
            </div>
          </button>

          <button 
            onClick={() => setShowModal('withdraw')}
            className="group relative overflow-hidden bg-brand-800 border border-gray-700 hover:border-red-500/50 hover:bg-brand-800/80 text-white rounded-xl p-4 flex flex-col items-center justify-center gap-2 shadow-lg active:scale-95 transition-all duration-200"
          >
            <div className="bg-red-500/10 text-red-500 p-2 rounded-full group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
              <ArrowDownLeft size={24} />
            </div>
            <div className="text-center">
              <span className="block font-bold text-lg leading-tight text-gray-200 group-hover:text-white">Withdraw</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium group-hover:text-red-400">Via Support</span>
            </div>
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3 items-start">
            <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={20} />
            <div className="space-y-1">
              <p className="text-sm font-bold text-blue-400">Transaction Info</p>
              <p className="text-xs text-blue-200/70 leading-relaxed">
                1 Coin = ₹1. Minimum withdrawal is 100 Coins. All transactions are monitored 24/7.
              </p>
            </div>
        </div>

        {/* History */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <History size={18} className="text-brand-500" /> 
              History
            </h3>
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">Last 30 Days</span>
          </div>
          
          <div className="space-y-3">
            {transactions.length > 0 ? (
              transactions.map((tx) => (
                <div key={tx.id} className="bg-brand-800 border border-gray-700 rounded-xl p-4 flex justify-between items-center group hover:border-brand-500/30 transition-all duration-300">
                   <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 ${
                        tx.type === 'credit' 
                          ? 'bg-gradient-to-br from-green-500/20 to-green-600/10 text-green-500 border border-green-500/20' 
                          : 'bg-gradient-to-br from-red-500/20 to-red-600/10 text-red-500 border border-red-500/20'
                      }`}>
                        {tx.type === 'credit' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-brand-gold transition-colors">{tx.desc}</p>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">{tx.date}</p>
                      </div>
                   </div>
                   <div className="text-right">
                     <span className={`text-lg font-black block tracking-tight ${
                       tx.type === 'credit' ? 'text-green-500' : 'text-red-500'
                     }`}>
                       {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                     </span>
                     <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                       tx.type === 'credit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                     }`}>{tx.type}</span>
                   </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-brand-800/30 rounded-xl border border-gray-800 border-dashed">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
                  <History size={32} />
                </div>
                <p className="text-gray-400 font-bold">No Transactions</p>
                <p className="text-gray-600 text-sm mt-1">Your recent activity will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Wallet;