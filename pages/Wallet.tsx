
import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, Button, Input } from '../components/UI';
import { useAuth } from '../contexts/AuthContext';
import { History, TrendingUp, TrendingDown, Ticket, Plus, ArrowUpRight, X, Smartphone, AlertCircle, Copy, CheckCircle, Download, Clock, Landmark, CreditCard, ShieldCheck, ChevronRight, ScanLine, AlertTriangle, Info, Clipboard, Image as ImageIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwHAsGV11ZIy7Vg53HPFIft8260HuoLT-t7JoBMOM49-Swy3yz0-dwNQa3AVQPTgNIXyw/exec";

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
       const str = reader.result as string;
       if(str.includes(',')) {
         resolve(str.split(',')[1]);
       } else {
         resolve(str);
       }
    };
    reader.onerror = error => reject(error);
  });
};

const Wallet: React.FC = () => {
  const { userProfile, transactions, applyPromoCode, requestDeposit, withdrawMoney } = useAuth();
  const [promoCode, setPromoCode] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);
  
  // Deposit State
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [processingDeposit, setProcessingDeposit] = useState(false);

  // Withdraw State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'UPI' | 'Bank'>('UPI');
  const [withdrawDetails, setWithdrawDetails] = useState(''); // UPI ID or Bank Account Number
  const [bankIfsc, setBankIfsc] = useState('');
  const [bankName, setBankName] = useState('');
  const [processingWithdraw, setProcessingWithdraw] = useState(false);
  
  // UI State for Copy
  const [copied, setCopied] = useState(false);

  // Quick Add Amounts
  const quickAmounts = [100, 200, 500, 1000];

  // Official Assets
  const ASSETS = {
      gpay: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg",
      phonepe: "https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg",
      paytm: "https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg",
      upi: "https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg"
  };

  const handleApplyPromo = async () => {
      if(!promoCode) return;
      setApplyingPromo(true);
      try {
          const bonus = await applyPromoCode(promoCode);
          alert(`Success! ₹${bonus} credited.`);
          setPromoCode('');
      } catch (e: any) {
          alert(e.message);
      } finally {
          setApplyingPromo(false);
      }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setProofImage(e.target.files[0]);
      }
  };

  const handleDeposit = async () => {
      if(!depositAmount || !utrNumber) return;
      if(utrNumber.length !== 12) {
          alert("Please enter a valid 12-digit UTR number.");
          return;
      }
      
      setProcessingDeposit(true);
      try {
          let proofUrl = 'Not Provided';
          
          // 1. Upload Proof if exists
          if (proofImage) {
             const base64Str = await fileToBase64(proofImage);
             const imgPayload = {
                 type: 'image',
                 image: base64Str,
                 uid: userProfile?.uid || 'guest'
             };
             
             const imgRes = await fetch(APPS_SCRIPT_URL, {
                method: "POST",
                redirect: "follow",
                headers: { "Content-Type": "text/plain" },
                body: JSON.stringify(imgPayload)
             });
             
             if(imgRes.ok) {
                 const imgData = await imgRes.json();
                 proofUrl = imgData.url || imgData.response || imgData.text || 'Upload Failed';
             }
          }

          // 2. Log Deposit Request to Backend
          const logPayload = {
              type: 'deposit_log', // Log to sheet
              uid: userProfile?.uid || 'unknown',
              role: userProfile?.role || 'user',
              input: `Deposit Request: ₹${depositAmount} | UTR: ${utrNumber} | Proof: ${proofUrl}`,
              output: 'Pending Verification'
          };

          await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            redirect: "follow",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify(logPayload)
          });

          // 3. Update Local State (Mock)
          await requestDeposit(Number(depositAmount), utrNumber, 'UPI');
          
          setShowDepositModal(false);
          setDepositAmount('');
          setUtrNumber('');
          setProofImage(null);
          alert("Verification Submitted! Admin will verify UTR and Screenshot.");

      } catch (error) {
          console.error("Deposit Error:", error);
          alert("Connection failed. Please check internet.");
      } finally {
          setProcessingDeposit(false);
      }
  }

  const handleWithdraw = async () => {
      const amount = Number(withdrawAmount);
      if(!amount) return;

      // --- WITHDRAWAL LIMITS ---
      if (amount < 100) {
          alert("Minimum withdrawal amount is ₹100.");
          return;
      }
      if (amount > 500) {
          alert("Maximum withdrawal limit is ₹500 per day.");
          return;
      }

      if(amount > (userProfile?.coins || 0)) {
          alert("Insufficient Balance!");
          return;
      }

      let finalDetails = withdrawDetails;

      if (withdrawMethod === 'Bank') {
          if (!withdrawDetails || !bankIfsc || !bankName) {
              alert("Please fill all bank details.");
              return;
          }
          if (bankIfsc.length !== 11) {
              alert("Invalid IFSC Code (Must be 11 characters)");
              return;
          }
          finalDetails = `Ac: ${withdrawDetails} | IFSC: ${bankIfsc} | Name: ${bankName}`;
      } else {
          // UPI
          if (!withdrawDetails) {
              alert("Please enter a valid UPI ID");
              return;
          }
      }

      setProcessingWithdraw(true);
      try {
        await withdrawMoney(amount, finalDetails, withdrawMethod);
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        setWithdrawDetails('');
        setBankIfsc('');
        setBankName('');
        alert("Withdrawal Request Submitted! It will be processed within 24 hours.");
      } catch (e: any) {
        alert(e.message);
      } finally {
        setProcessingWithdraw(false);
      }
  }

  // Handle Withdrawal Method Switch
  const handleSwitchWithdrawMethod = (method: 'UPI' | 'Bank') => {
      if (withdrawMethod === method) return;
      setWithdrawMethod(method);
      setWithdrawDetails(''); // Clear shared input (UPI ID or Account Number)
      if (method === 'UPI') {
          setBankIfsc('');
          setBankName('');
      }
  };

  // UPI Configuration
  const UPI_ID = "6205557860@ybl";
  const PAYEE_NAME = "RK_Esports";

  // Handle opening payment apps securely
  const handlePaymentAppClick = (scheme: string) => {
      if (!depositAmount || Number(depositAmount) <= 0) {
          alert("⚠️ Please enter a valid amount first!");
          return;
      }

      const amt = depositAmount;
      const baseParams = `pa=${UPI_ID}&pn=${PAYEE_NAME}&am=${amt}&cu=INR`;
      const url = `${scheme}?${baseParams}`;
      
      // Redirect to the payment app
      window.location.href = url;
  };

  const handleCopyUPI = () => {
      navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      if(navigator.vibrate) navigator.vibrate(50);
      setTimeout(() => setCopied(false), 2000);
  };

  const handlePasteUTR = async () => {
      try {
          const text = await navigator.clipboard.readText();
          if (text) {
              // Extract only numbers and limit to 12 chars
              const numericValue = text.replace(/\D/g, '').slice(0, 12);
              setUtrNumber(numericValue);
          }
      } catch (err) {
          console.error('Failed to read clipboard', err);
          // Fallback handled by browser default paste
      }
  };

  const handleDownloadQR = async () => {
      try {
          const amt = depositAmount && Number(depositAmount) > 0 ? depositAmount : '0';
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=upi://pay?pa=${UPI_ID}&pn=${PAYEE_NAME}&am=${amt}&cu=INR`;
          
          const response = await fetch(qrUrl);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          
          const link = document.createElement('a');
          link.href = url;
          link.download = 'rk_esports_qr.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
      } catch (error) {
          alert("Unable to download image automatically. Please take a screenshot.");
      }
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'success': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
          case 'pending': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
          case 'failed': return 'text-red-500 bg-red-500/10 border-red-500/20';
          default: return 'text-gray-500';
      }
  };

  const getStatusIcon = (status: string, type: 'credit' | 'debit') => {
      if(status === 'pending') return <Clock size={16} />;
      return type === 'credit' ? <TrendingUp size={16} /> : <TrendingDown size={16} />;
  }

  return (
    <Layout>
      <div className="space-y-8 pb-10">
        
        {/* Header Section */}
        <div className="flex items-center justify-between">
           <div>
              <h2 className="text-2xl font-display font-bold text-white tracking-wide">MY WALLET</h2>
              <p className="text-xs text-gray-500 font-medium">Manage your earnings & deposits</p>
           </div>
           <div className="bg-brand-800/50 px-3 py-1.5 rounded-full border border-white/5 flex items-center gap-2">
              <ShieldCheck size={14} className="text-green-500" />
              <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider">100% Secure</span>
           </div>
        </div>

        {/* Balance Card - Premium Look */}
        <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
            <Card className="bg-gradient-to-br from-[#1a1a1c] to-[#0f0f11] border-white/10 relative overflow-hidden shadow-2xl !p-8">
               <div className="absolute top-0 right-0 p-6 opacity-10">
                  <CreditCard size={120} className="text-white rotate-12" />
               </div>
               
               <div className="relative z-10 flex flex-col items-center justify-center py-4">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Available Balance
                  </p>
                  <h1 className="text-6xl font-black text-white tracking-tighter drop-shadow-2xl flex items-start gap-2">
                    <span className="text-3xl text-gray-500 font-medium mt-2">₹</span>
                    {userProfile?.coins || 0}
                  </h1>
                  
                  <div className="flex gap-4 mt-8 w-full max-w-md">
                     <Button 
                       className="flex-1 bg-white text-black hover:bg-gray-200 border-none shadow-xl h-12"
                       onClick={() => setShowDepositModal(true)}
                     >
                        <Plus size={18} /> ADD CASH
                     </Button>
                     <Button 
                       variant="outline" 
                       className="flex-1 h-12 border-white/20 hover:bg-white/5 text-white"
                       onClick={() => setShowWithdrawModal(true)}
                     >
                        <ArrowUpRight size={18} /> WITHDRAW
                     </Button>
                  </div>
               </div>
            </Card>
        </div>

        {/* Promo Code Section */}
        <div className="bg-gradient-to-r from-brand-900 to-brand-800 p-1 rounded-2xl border border-white/5 shadow-lg">
            <div className="bg-[#0f0f11] rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
                <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-brand-500/10 rounded-full flex items-center justify-center text-brand-500">
                        <Ticket size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wide">Have a Promo Code?</h3>
                        <p className="text-[10px] text-gray-400">Enter code to get instant bonus cash.</p>
                    </div>
                </div>
                <div className="flex flex-col w-full md:w-auto">
                    <div className="flex gap-2">
                        <input 
                           placeholder="Ex: RK2025" 
                           value={promoCode} 
                           onChange={e => setPromoCode(e.target.value)}
                           maxLength={20} // Limit promo code length
                           className="bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-xs text-white placeholder-gray-600 focus:border-brand-500/50 outline-none w-full md:w-40 font-mono uppercase"
                        />
                        <button 
                           onClick={handleApplyPromo} 
                           disabled={applyingPromo || !promoCode} 
                           className="bg-brand-800 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-lg border border-white/10 transition-colors disabled:opacity-50"
                        >
                            APPLY
                        </button>
                    </div>
                    {/* Character Count */}
                    <p className="text-[10px] text-gray-500 text-right mt-1 pr-1 font-mono">
                        {promoCode.length}/20
                    </p>
                </div>
            </div>
        </div>

        {/* Transactions */}
        <div>
          <div className="flex items-center justify-between mb-6 px-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <History size={20} className="text-brand-500" /> 
                  Transaction History
              </h3>
          </div>
          
          <div className="space-y-3">
            {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 bg-brand-900/30 rounded-2xl border border-white/5 border-dashed">
                    <Clock size={32} className="mb-3 opacity-20" />
                    <p className="text-sm">No transactions yet.</p>
                </div>
            ) : transactions.map((tx) => (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={tx.id} 
                    className="bg-[#121214] border border-white/5 hover:border-white/10 rounded-2xl p-4 flex justify-between items-center transition-colors group"
                >
                   <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors group-hover:scale-105 ${getStatusColor(tx.status)}`}>
                        {getStatusIcon(tx.status, tx.type)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white leading-tight mb-1">{tx.description}</p>
                        <div className="flex items-center gap-2 text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                            <span>{tx.date}</span>
                            <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                            <span className={tx.status === 'success' ? 'text-green-500' : tx.status === 'pending' ? 'text-amber-500' : 'text-red-500'}>
                                {tx.status}
                            </span>
                        </div>
                      </div>
                   </div>
                   <div className="text-right">
                       <span className={`font-black font-mono text-lg block ${tx.type === 'credit' ? 'text-emerald-500' : 'text-white'}`}>
                           {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                       </span>
                       {tx.type === 'credit' && <span className="text-[9px] text-gray-600 font-bold uppercase">Credited</span>}
                   </div>
                </motion.div>
            ))}
          </div>
        </div>

        {/* --- DEPOSIT MODAL --- */}
        <AnimatePresence>
            {showDepositModal && (
                <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                        onClick={() => setShowDepositModal(false)}
                    />
                    
                    <motion.div 
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-[#0f0f11] w-full sm:w-[90%] sm:max-w-lg rounded-t-[2rem] sm:rounded-3xl border-t sm:border border-white/10 relative shadow-2xl h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col z-10"
                    >
                        {/* Header (Fixed) */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#141416]">
                            <div>
                                <h3 className="text-xl font-bold text-white">Add Funds</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Secure payment via UPI</p>
                            </div>
                            <button onClick={() => setShowDepositModal(false)} className="bg-white/5 p-2 rounded-full text-gray-400 hover:text-white transition-colors"><X size={20}/></button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8 pb-8">
                            
                            {/* QR Section */}
                            <div className="flex flex-col items-center">
                                <div className="bg-white p-4 rounded-3xl shadow-[0_0_40px_rgba(255,255,255,0.05)] border-4 border-white/10 mb-4 relative group">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-500 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm z-10 uppercase tracking-wide">Verified Merchant</div>
                                    <img 
                                      src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=${UPI_ID}&pn=${PAYEE_NAME}&am=${depositAmount && Number(depositAmount) > 0 ? depositAmount : '0'}&cu=INR`} 
                                      alt="QR" 
                                      className="w-40 h-40 object-contain" 
                                    />
                                    <div className="mt-2 text-center border-t border-dashed border-gray-200 pt-2 flex items-center justify-between gap-2">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Scan to Pay</p>
                                        <button 
                                            onClick={handleDownloadQR}
                                            className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded flex items-center gap-1 text-[10px] font-bold transition-colors"
                                        >
                                            <Download size={10} /> SAVE QR
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2 bg-[#1a1a1c] p-1.5 pr-3 rounded-xl border border-white/5">
                                    <div className="bg-brand-500/10 px-2 py-1 rounded-lg">
                                        <p className="text-[10px] text-brand-500 font-bold">UPI ID</p>
                                    </div>
                                    <p className="text-xs font-mono text-white tracking-wide">{UPI_ID}</p>
                                    <button onClick={handleCopyUPI} className="ml-2 text-gray-500 hover:text-white">
                                        {copied ? <CheckCircle size={14} className="text-green-500"/> : <Copy size={14}/>}
                                    </button>
                                </div>
                            </div>

                            {/* STEP 1: AMOUNT */}
                            <div>
                                <label className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-3 block flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-brand-800 border border-white/10 flex items-center justify-center text-[10px] text-white">1</span>
                                    Enter Amount
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-medium">₹</span>
                                    <Input 
                                        type="number" 
                                        value={depositAmount} 
                                        onChange={e => setDepositAmount(e.target.value)} 
                                        placeholder="100" 
                                        className="pl-8 text-2xl font-bold text-white border-brand-500/30 bg-black/40 h-16 rounded-2xl focus:border-brand-500 transition-colors"
                                    />
                                </div>
                                <div className="grid grid-cols-4 gap-2 mt-3">
                                    {quickAmounts.map(amt => (
                                        <button
                                            key={amt}
                                            onClick={() => setDepositAmount(amt.toString())}
                                            className="py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 bg-[#1a1a1c] border-white/5 text-gray-400 hover:text-white hover:border-white/20"
                                        >
                                            ₹{amt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* STEP 2: PAYMENT APP */}
                            <div>
                                <label className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-3 block flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-brand-800 border border-white/10 flex items-center justify-center text-[10px] text-white">2</span>
                                    Pay Using
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => handlePaymentAppClick('tez://upi/pay')} className="flex items-center gap-3 p-3 rounded-xl bg-[#1a1a1c] border border-white/5 hover:border-brand-500/50 hover:bg-[#202022] transition-all group text-left">
                                        <div className="w-10 h-10 bg-white rounded-lg p-2 flex items-center justify-center shrink-0">
                                            <img src={ASSETS.gpay} alt="GPay" className="w-full h-full object-contain" />
                                        </div>
                                        <div>
                                            <span className="block text-xs font-bold text-white group-hover:text-brand-500">Google Pay</span>
                                            <span className="text-[9px] text-gray-500">Instant</span>
                                        </div>
                                    </button>
                                    
                                    <button onClick={() => handlePaymentAppClick('phonepe://pay')} className="flex items-center gap-3 p-3 rounded-xl bg-[#1a1a1c] border border-white/5 hover:border-brand-500/50 hover:bg-[#202022] transition-all group text-left">
                                        <div className="w-10 h-10 bg-[#5f259f] rounded-lg p-2 flex items-center justify-center shrink-0">
                                            <img src={ASSETS.phonepe} alt="PhonePe" className="w-full h-full object-contain filter brightness-0 invert" />
                                        </div>
                                        <div>
                                            <span className="block text-xs font-bold text-white group-hover:text-brand-500">PhonePe</span>
                                            <span className="text-[9px] text-gray-500">Fastest</span>
                                        </div>
                                    </button>

                                    <button onClick={() => handlePaymentAppClick('paytmmp://pay')} className="flex items-center gap-3 p-3 rounded-xl bg-[#1a1a1c] border border-white/5 hover:border-brand-500/50 hover:bg-[#202022] transition-all group text-left">
                                        <div className="w-10 h-10 bg-white rounded-lg p-1 flex items-center justify-center shrink-0">
                                            <img src={ASSETS.paytm} alt="Paytm" className="w-full h-full object-contain" />
                                        </div>
                                        <div>
                                            <span className="block text-xs font-bold text-white group-hover:text-brand-500">Paytm</span>
                                            <span className="text-[9px] text-gray-500">Zero Fee</span>
                                        </div>
                                    </button>

                                    <button onClick={() => handlePaymentAppClick('upi://pay')} className="flex items-center gap-3 p-3 rounded-xl bg-[#1a1a1c] border border-white/5 hover:border-brand-500/50 hover:bg-[#202022] transition-all group text-left">
                                        <div className="w-10 h-10 bg-white rounded-lg p-2 flex items-center justify-center shrink-0">
                                            <img src={ASSETS.upi} alt="BHIM" className="w-full h-full object-contain" />
                                        </div>
                                        <div>
                                            <span className="block text-xs font-bold text-white group-hover:text-brand-500">BHIM / Other</span>
                                            <span className="text-[9px] text-gray-500">UPI Apps</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* STEP 3: VERIFY */}
                            <div className="bg-brand-800/30 rounded-2xl p-4 border border-white/5">
                                <label className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-3 block flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-brand-800 border border-white/10 flex items-center justify-center text-[10px] text-white">3</span>
                                    Verify Transaction
                                </label>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Input 
                                            value={utrNumber} 
                                            onChange={e => {
                                                const val = e.target.value.replace(/\D/g, ''); // Remove non-digits
                                                if (val.length <= 12) setUtrNumber(val);
                                            }}
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="Enter 12 Digit UTR / Ref No." 
                                            className="text-sm font-mono h-12 tracking-wide border-white/10 bg-black/50 pr-12"
                                        />
                                        <button 
                                            onClick={handlePasteUTR}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-brand-500 hover:text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 rounded-lg transition-colors"
                                            title="Paste UTR"
                                        >
                                            <Clipboard size={16} />
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-gray-500 text-right mt-1">{utrNumber.length}/12</p>
                                    
                                    {/* Proof Upload */}
                                    <div className="relative">
                                        <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Payment Screenshot (Optional)</label>
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="proof-upload"
                                        />
                                        <label 
                                            htmlFor="proof-upload"
                                            className={`flex items-center justify-between p-3 rounded-xl border border-dashed cursor-pointer transition-colors ${proofImage ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-black/30 border-white/10 text-gray-400 hover:border-brand-500/50'}`}
                                        >
                                            <span className="text-xs font-medium truncate flex-1 mr-2">
                                                {proofImage ? proofImage.name : "Click to upload proof"}
                                            </span>
                                            {proofImage ? <CheckCircle size={16} /> : <ImageIcon size={16} />}
                                        </label>
                                    </div>
                                </div>
                                
                                <div className="mt-3 flex gap-2 items-start">
                                    <AlertTriangle size={14} className="text-yellow-500 shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-gray-400 leading-relaxed">
                                        Ensure UTR is correct. Uploading a screenshot speeds up verification.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Fixed Footer */}
                        <div className="p-6 border-t border-white/10 bg-[#141416] shrink-0 z-20 pb-20">
                            <Button onClick={handleDeposit} disabled={processingDeposit || utrNumber.length !== 12 || !depositAmount} className="h-14 text-lg font-black tracking-wider w-full shadow-xl">
                                {processingDeposit ? 'VERIFYING...' : 'SUBMIT REQUEST'}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        {/* Withdrawal Modal */}
        <AnimatePresence>
            {showWithdrawModal && (
                <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <motion.div 
                         initial={{ opacity: 0 }} 
                         animate={{ opacity: 1 }} 
                         exit={{ opacity: 0 }} 
                         className="absolute inset-0 bg-black/90 backdrop-blur-md"
                         onClick={() => setShowWithdrawModal(false)}
                    />
                    
                    <motion.div 
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-[#0f0f11] w-full sm:w-[90%] sm:max-w-lg rounded-t-[2rem] sm:rounded-3xl border-t sm:border border-white/10 relative shadow-2xl h-[100dvh] sm:h-auto sm:max-h-[85vh] flex flex-col z-10"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#141416]">
                            <div>
                                <h3 className="text-xl font-bold text-white">Withdraw</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Transfer winnings to bank</p>
                            </div>
                            <button onClick={() => setShowWithdrawModal(false)} className="bg-white/5 p-2 rounded-full text-gray-400 hover:text-white transition-colors z-20"><X size={20}/></button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6 pb-8">
                            
                            {/* Amount Input */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-xs text-gray-500 font-bold uppercase tracking-widest">Withdraw Amount</label>
                                    <span className="text-xs text-gray-400">Available: <span className="text-white font-bold">₹{userProfile?.coins}</span></span>
                                </div>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-medium">₹</span>
                                    <Input 
                                        type="number" 
                                        value={withdrawAmount} 
                                        onChange={e => setWithdrawAmount(e.target.value)} 
                                        placeholder="0" 
                                        className="pl-8 text-xl font-bold text-white bg-black/40 h-14 border-white/10 focus:border-white/30"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-500 mt-1">Min: ₹100 | Max: ₹500 per day</p>
                            </div>

                            {/* Method Selection */}
                            <div>
                                <label className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-3 block">Transfer Method</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => handleSwitchWithdrawMethod('UPI')}
                                        className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${withdrawMethod === 'UPI' ? 'bg-white text-black border-white shadow-lg' : 'bg-brand-800/50 border-white/5 text-gray-400 hover:bg-brand-800'}`}
                                    >
                                        <Smartphone size={24} />
                                        <span className="text-xs font-bold">UPI Transfer</span>
                                    </button>
                                    <button 
                                        onClick={() => handleSwitchWithdrawMethod('Bank')}
                                        className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${withdrawMethod === 'Bank' ? 'bg-white text-black border-white shadow-lg' : 'bg-brand-800/50 border-white/5 text-gray-400 hover:bg-brand-800'}`}
                                    >
                                        <Landmark size={24} />
                                        <span className="text-xs font-bold">Bank Transfer</span>
                                    </button>
                                </div>
                            </div>

                            {/* Details Input */}
                            <div className="bg-brand-800/30 p-4 rounded-2xl border border-white/5">
                                <label className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-3 block">
                                    {withdrawMethod === 'UPI' ? 'Recipient Details' : 'Bank Account Details'}
                                </label>
                                {withdrawMethod === 'UPI' ? (
                                    <div>
                                        <Input 
                                            placeholder="Enter UPI ID (e.g. 9876543210@ybl)" 
                                            value={withdrawDetails}
                                            onChange={e => setWithdrawDetails(e.target.value)}
                                            maxLength={50} // Limit UPI ID length
                                            className="bg-black/50 border-white/10"
                                        />
                                        <p className="text-[10px] text-gray-500 text-right mt-1">{withdrawDetails.length}/50</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div>
                                            <Input 
                                                placeholder="Account Number" 
                                                value={withdrawDetails}
                                                onChange={e => setWithdrawDetails(e.target.value)}
                                                maxLength={18} // Limit Account Number length
                                                className="bg-black/50 border-white/10"
                                            />
                                            <p className="text-[10px] text-gray-500 text-right mt-1">{withdrawDetails.length}/18</p>
                                        </div>
                                        <div>
                                            <Input 
                                                placeholder="IFSC Code" 
                                                value={bankIfsc}
                                                onChange={e => setBankIfsc(e.target.value.toUpperCase())}
                                                maxLength={11} // Limit IFSC Code length
                                                className="bg-black/50 border-white/10" 
                                            />
                                            <p className="text-[10px] text-gray-500 text-right mt-1">{bankIfsc.length}/11</p>
                                        </div>
                                        <div>
                                            <Input 
                                                placeholder="Account Holder Name" 
                                                value={bankName}
                                                onChange={e => setBankName(e.target.value)}
                                                maxLength={40} // Limit Account Holder Name length
                                                className="bg-black/50 border-white/10" 
                                            />
                                            <p className="text-[10px] text-gray-500 text-right mt-1">{bankName.length}/40</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                                <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-blue-300/80 leading-relaxed">
                                    Withdrawals are processed manually to ensure security. It may take up to 24 hours for the amount to reflect in your account.
                                </p>
                            </div>
                        </div>

                        {/* Fixed Footer */}
                        <div className="p-6 border-t border-white/10 bg-[#141416] shrink-0 z-20 pb-20">
                            <Button 
                                onClick={handleWithdraw} 
                                disabled={processingWithdraw || !withdrawAmount || (withdrawMethod === 'UPI' ? !withdrawDetails : (!withdrawDetails || !bankIfsc || !bankName))}
                                className="h-14 text-lg w-full font-black tracking-wide"
                            >
                                {processingWithdraw ? 'PROCESSING...' : 'CONFIRM WITHDRAWAL'}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default Wallet;
