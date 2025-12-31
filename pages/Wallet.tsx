import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card, Button, Input } from '../components/UI';
import { useAuth } from '../contexts/AuthContext';
import { History, TrendingUp, TrendingDown, AlertCircle, ArrowDownLeft, X, Headset, CheckCircle, Loader2, QrCode, Copy, ChevronRight, ShieldCheck, Lock, Grid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';

const ADMIN_UPI_ID = "6205557860@ybl"; 
const ADMIN_NAME = "Fulkumari Devi";
const MIN_DEPOSIT_AMOUNT = 10;

// --- USER PROVIDED REAL LOGOS (FIXED MAPPING) ---
// 1. Google Pay
const GPAY_IMG = "https://i.ibb.co/v6R8ZZ2p/6728d8f618ff531833c69bd830569376.jpg";
// 2. PhonePe
const PHONEPE_IMG = "https://i.ibb.co/B2cr34wF/download.png";
// 3. Paytm
const PAYTM_IMG = "https://i.ibb.co/S719N0XJ/download-1.png";

const Wallet: React.FC = () => {
  const { userProfile, transactions, requestDeposit, withdrawMoney } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState<'add' | 'withdraw' | null>(null);
  
  // Add Money State
  const [addAmount, setAddAmount] = useState<string>('');
  const [utr, setUtr] = useState('');
  const [step, setStep] = useState<1 | 2>(1); // 1: Amount/Pay, 2: UTR Submission
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [qrUrl, setQrUrl] = useState('');

  // Withdraw State
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [upiId, setUpiId] = useState('');
  const [withdrawError, setWithdrawError] = useState('');

  // Animation logic
  const controls = useAnimation();
  const [prevCoins, setPrevCoins] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (userProfile?.coins !== undefined) {
      if (prevCoins === undefined) {
        setPrevCoins(userProfile.coins);
      } else if (userProfile.coins !== prevCoins) {
        controls.start({
          scale: [1, 1.3, 1],
          textShadow: [
            "0 0 0px rgba(255,215,0,0)",
            "0 0 20px rgba(255,215,0,0.8)",
            "0 0 0px rgba(255,215,0,0)"
          ],
          color: ["#ffd700", "#ffffff", "#ffd700"],
          transition: { duration: 0.6, ease: "easeInOut" }
        });
        setPrevCoins(userProfile.coins);
      }
    }
  }, [userProfile?.coins, prevCoins, controls]);

  // Update QR URL when amount changes
  useEffect(() => {
    const amount = parseFloat(addAmount) || 0;
    const link = `upi://pay?pa=${ADMIN_UPI_ID}&pn=${encodeURIComponent(ADMIN_NAME)}&am=${amount}&cu=INR`;
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`);
  }, [addAmount]);

  const handleContactSupport = () => {
    navigate('/support');
    setShowModal(null);
  };

  const handleCopyUpi = () => {
      navigator.clipboard.writeText(ADMIN_UPI_ID);
      alert("UPI ID Copied!");
  }

  const handleAppPayment = (app: 'phonepe' | 'gpay' | 'paytm' | 'other') => {
    const amount = parseFloat(addAmount);
    if (!amount || amount < MIN_DEPOSIT_AMOUNT) {
      alert(`Minimum deposit amount is ₹${MIN_DEPOSIT_AMOUNT}`);
      return;
    }

    const params = `pa=${ADMIN_UPI_ID}&pn=${encodeURIComponent(ADMIN_NAME)}&am=${amount}&cu=INR&tn=TopUp`;
    let url = "";

    switch(app) {
        case 'phonepe':
            url = `phonepe://pay?${params}`;
            break;
        case 'gpay':
            url = `tez://upi/pay?${params}`;
            break;
        case 'paytm':
            url = `paytmmp://pay?${params}`;
            break;
        case 'other':
            url = `upi://pay?${params}`; // Opens system intent
            break;
    }

    // Try to open the specific app
    window.location.href = url;
    
    // Automatically move to next step to ask for UTR
    setTimeout(() => {
        setStep(2);
    }, 1500);
  };

  const handleDepositSubmit = async () => {
      const cleanUtr = utr.replace(/\s/g, '').trim();
      
      // Strict UTR Validation: At least 12 chars, alphanumeric only
      const utrRegex = /^[a-zA-Z0-9]{12,}$/;

      if(!utrRegex.test(cleanUtr)) {
          alert("Invalid UTR! Reference number must be at least 12 characters long and contain only letters/numbers.");
          return;
      }
      
      setProcessing(true);
      await requestDeposit(parseInt(addAmount), cleanUtr, 'UPI_DIRECT');
      setProcessing(false);
      setSuccess(true);
      setTimeout(() => {
          setSuccess(false);
          setShowModal(null);
          setAddAmount('');
          setUtr('');
          setStep(1);
      }, 2500);
  }

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    const amt = parseInt(withdrawAmount);
    
    if (amt < 100) {
      setWithdrawError("Minimum withdrawal is ₹100");
      return;
    }
    if (!upiId.includes('@')) {
      setWithdrawError("Invalid UPI ID");
      return;
    }
    
    setProcessing(true);
    try {
      await withdrawMoney(amt, upiId);
      setProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setShowModal(null);
        setWithdrawAmount('');
        setUpiId('');
      }, 2000);
    } catch (err: any) {
      setProcessing(false);
      setWithdrawError(err.message || "Failed to withdraw");
    }
  };

  return (
    <Layout>
      <AnimatePresence>
      {showModal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md"
        >
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full max-w-sm bg-[#0f0f11] rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative max-h-[95vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5 bg-[#18181b]">
               <div className="flex items-center gap-2">
                 <ShieldCheck className="text-green-500" size={18} />
                 <span className="text-xs font-bold text-green-500 uppercase tracking-wider">100% Secure Payment</span>
               </div>
               <button onClick={() => setShowModal(null)} className="p-2 -mr-2 text-gray-400 hover:text-white">
                 <X size={20} />
               </button>
            </div>

            {/* Modal Content */}
            <div className="p-5">
               {success ? (
                 <div className="py-12 flex flex-col items-center justify-center text-center">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white mb-4 shadow-[0_0_20px_#22c55e]"
                    >
                       <CheckCircle size={40} />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white mb-2">{showModal === 'add' ? 'Request Submitted!' : 'Withdrawal Pending'}</h3>
                    <p className="text-gray-400">{showModal === 'add' ? 'Admin will verify your UTR shortly.' : 'Amount will be credited within 24 hours.'}</p>
                 </div>
               ) : (
                 <>
                   {showModal === 'add' ? (
                     <div className="space-y-6">
                        {step === 1 ? (
                            // STEP 1: Amount & Pay
                            <div className="space-y-6">
                                {/* Amount Input */}
                                <div className="space-y-3">
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block ml-1">Add Balance</label>
                                    <div className="relative group">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-3xl font-bold text-gray-400 z-10 group-focus-within:text-white transition-colors">₹</span>
                                        <input 
                                            type="number" 
                                            value={addAmount}
                                            onChange={(e) => setAddAmount(e.target.value)}
                                            placeholder="100"
                                            className="w-full bg-[#18181b] border-2 border-transparent focus:border-brand-500 rounded-2xl py-5 pl-12 pr-4 text-4xl font-bold text-white focus:outline-none transition-all placeholder:text-gray-700 font-display shadow-inner"
                                        />
                                    </div>
                                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                                        {[10, 50, 100, 200, 500].map(amt => (
                                            <button 
                                                key={amt}
                                                onClick={() => setAddAmount(amt.toString())}
                                                className="flex-shrink-0 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-xs font-bold text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all active:scale-95"
                                            >
                                                ₹{amt}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Payment Grid */}
                                <div>
                                    <div className="flex items-center justify-between mb-3 px-1">
                                        <p className="text-xs font-bold text-gray-300">Select Payment Method</p>
                                        <div className="flex items-center gap-1 text-[10px] text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                                          <Lock size={10} /> Secure SSL
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Google Pay */}
                                        <button 
                                            onClick={() => handleAppPayment('gpay')}
                                            disabled={!addAmount || parseFloat(addAmount) < MIN_DEPOSIT_AMOUNT}
                                            className="relative overflow-hidden bg-[#18181b] hover:bg-[#27272a] border border-white/10 text-white p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                        >
                                            <img src={GPAY_IMG} alt="GPay" className="w-10 h-10 rounded-lg object-contain" />
                                            <span className="font-bold text-xs tracking-wide">Google Pay</span>
                                        </button>
                                        
                                        {/* PhonePe */}
                                        <button 
                                            onClick={() => handleAppPayment('phonepe')}
                                            disabled={!addAmount || parseFloat(addAmount) < MIN_DEPOSIT_AMOUNT}
                                            className="relative overflow-hidden bg-[#18181b] hover:bg-[#27272a] border border-white/10 text-white p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                        >
                                            <img src={PHONEPE_IMG} alt="PhonePe" className="w-10 h-10 rounded-lg object-contain" />
                                            <span className="font-bold text-xs tracking-wide">PhonePe</span>
                                        </button>

                                        {/* Paytm */}
                                        <button 
                                            onClick={() => handleAppPayment('paytm')}
                                            disabled={!addAmount || parseFloat(addAmount) < MIN_DEPOSIT_AMOUNT}
                                            className="relative overflow-hidden bg-[#18181b] hover:bg-[#27272a] border border-white/10 text-white p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                        >
                                            <img src={PAYTM_IMG} alt="Paytm" className="w-10 h-10 rounded-lg object-contain" />
                                            <span className="font-bold text-xs tracking-wide">Paytm</span>
                                        </button>

                                        {/* Other Apps - Generic 'Any UPI' Option */}
                                        <button 
                                            onClick={() => handleAppPayment('other')}
                                            disabled={!addAmount || parseFloat(addAmount) < MIN_DEPOSIT_AMOUNT}
                                            className="relative overflow-hidden bg-[#18181b] hover:bg-[#27272a] border border-white/10 text-white p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-white border border-white/10">
                                                <Grid size={24} />
                                            </div>
                                            <span className="font-bold text-xs tracking-wide">Any UPI App</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Secondary - Manual QR */}
                                <div className="border-t border-white/5 pt-4">
                                    <button 
                                       onClick={() => setStep(2)}
                                       className="w-full py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 group"
                                    >
                                       <QrCode size={16} className="text-gray-500 group-hover:text-white" />
                                       Show QR Code / Manual Transfer
                                       <ChevronRight size={14} className="opacity-50" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // STEP 2: UTR Submission (Formal Verification Look)
                            <div className="space-y-5">
                                <div className="bg-brand-800 p-4 rounded-xl border border-white/10 text-center">
                                    <div className="mx-auto w-32 h-32 bg-white p-2 rounded-xl mb-3 shadow-lg">
                                        <img src={qrUrl} alt="QR" className="w-full h-full object-contain" />
                                    </div>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Paying To</p>
                                    <div className="flex items-center justify-center gap-2 bg-black/20 p-2 rounded-lg cursor-pointer hover:bg-black/40 transition-colors" onClick={handleCopyUpi}>
                                        <span className="text-white font-mono font-bold text-sm">{ADMIN_UPI_ID}</span>
                                        <Copy size={12} className="text-brand-500"/>
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">UTR / Reference No.</label>
                                        <span className="text-[10px] text-blue-400 cursor-pointer hover:underline">Where to find UTR?</span>
                                    </div>
                                    <input 
                                        type="text" 
                                        value={utr}
                                        onChange={(e) => setUtr(e.target.value)}
                                        placeholder="e.g. 3085xxxxxxxx"
                                        className="w-full bg-[#18181b] border border-white/10 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-brand-500 transition-colors font-mono tracking-widest text-lg shadow-inner"
                                    />
                                    <p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1">
                                        <AlertCircle size={10} /> Enter the 12-digit reference number from your payment app.
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">Back</Button>
                                    <Button onClick={handleDepositSubmit} disabled={processing} className="flex-[2]">
                                        {processing ? <Loader2 className="animate-spin" /> : 'VERIFY PAYMENT'}
                                    </Button>
                                </div>
                            </div>
                        )}
                     </div>
                   ) : (
                     <form onSubmit={handleWithdraw} className="space-y-6">
                        <div className="bg-brand-800 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                           <span className="text-gray-400 text-sm">Available Balance</span>
                           <span className="text-xl font-bold text-brand-gold">₹{userProfile?.coins}</span>
                        </div>

                        {withdrawError && (
                          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center">
                             {withdrawError}
                          </div>
                        )}

                        <div>
                          <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2 block">Withdraw Amount</label>
                          <Input 
                            type="number"
                            placeholder="Min ₹100"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            required
                          />
                        </div>

                        <div>
                          <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2 block">UPI ID</label>
                          <Input 
                            type="text"
                            placeholder="e.g. name@okhdfcbank"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            required
                          />
                        </div>

                        <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg text-[10px] text-yellow-200/80 leading-relaxed">
                          Note: Withdrawals are processed within 24 hours. Incorrect UPI ID may lead to loss of funds.
                        </div>

                        <Button 
                          type="submit" 
                          disabled={processing || !withdrawAmount || !upiId}
                          variant="secondary"
                          className="py-4"
                        >
                          {processing ? <Loader2 className="animate-spin" /> : 'WITHDRAW MONEY'}
                        </Button>
                     </form>
                   )}
                 </>
               )}
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

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
            <motion.h1 
              animate={controls}
              className="text-5xl font-black text-brand-gold tracking-tighter drop-shadow-sm flex items-center justify-center gap-1"
            >
              <span className="text-3xl opacity-50">₹</span>{userProfile?.coins || 0}
            </motion.h1>
            <p className="text-gray-500 text-xs mt-2 font-medium">Available to play</p>
          </div>
        </Card>

        {/* Visually Distinct Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => { setStep(1); setShowModal('add'); }}
            className="group relative overflow-hidden bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-xl p-4 flex flex-col items-center justify-center gap-2 shadow-lg shadow-green-900/20 active:scale-95 transition-all duration-200"
          >
            <div className="bg-white/20 p-2 rounded-full group-hover:rotate-90 transition-transform duration-300">
              <QrCode size={24} />
            </div>
            <div className="text-center">
              <span className="block font-bold text-lg leading-tight">Add Money</span>
              <span className="text-[10px] text-green-100/70 uppercase tracking-wider font-medium">Scan & Pay</span>
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
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium group-hover:text-red-400">To Bank/UPI</span>
            </div>
          </button>
        </div>

        {/* Direct Support Button */}
        <Button 
          variant="outline" 
          onClick={handleContactSupport} 
          className="w-full flex items-center justify-center gap-2 border-brand-500/20 text-brand-500 hover:bg-brand-500/10 hover:border-brand-500/40"
        >
          <Headset size={20} />
          Need Help? Contact Support
        </Button>

        {/* Info Banner */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3 items-start">
            <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={20} />
            <div className="space-y-1">
              <p className="text-sm font-bold text-blue-400">Transaction Info</p>
              <p className="text-xs text-blue-200/70 leading-relaxed">
                1 Coin = ₹1. Minimum withdrawal is ₹100. <br/>Deposits are verified manually via UTR (Approx 5-10 mins).
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
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">All Time</span>
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
                        <p className="text-sm font-bold text-white group-hover:text-brand-gold transition-colors">{tx.description}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                           <span className="text-xs text-gray-500 font-medium">{tx.date}</span>
                           <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                             tx.status === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                             tx.status === 'failed' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                             'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                           }`}>{tx.status}</span>
                        </div>
                      </div>
                   </div>
                   <div className="text-right">
                     <span className={`text-lg font-black block tracking-tight ${
                       tx.type === 'credit' ? 'text-green-500' : 'text-red-500'
                     }`}>
                       {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                     </span>
                     <span className="text-[10px] text-gray-500 font-bold uppercase">{tx.method}</span>
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