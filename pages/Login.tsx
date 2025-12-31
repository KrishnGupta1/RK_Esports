import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, Card } from '../components/UI';
import { useNavigate } from 'react-router-dom';
import { Smartphone, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIAssistant } from '../components/AIAssistant';

const Login: React.FC = () => {
  const { loginWithGoogle, userProfile, setupRecaptcha, sendOtp, verifyOtp, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [method, setMethod] = useState<'selection' | 'phone' | 'otp'>('selection');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!localLoading && userProfile) {
      if (userProfile.ffUid) {
        navigate('/dashboard');
      } else {
        navigate('/setup');
      }
    }
  }, [userProfile, navigate, localLoading]);

  // Initialize Recaptcha when switching to phone mode
  useEffect(() => {
    if (method === 'phone') {
      const timer = setTimeout(() => {
        try {
          setupRecaptcha('recaptcha-container');
        } catch (e) {
          console.error("Failed to init recaptcha", e);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [method, setupRecaptcha]);

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLocalLoading(true);
      await loginWithGoogle();
      // Navigation handled by useEffect, but we also explicitly check here
      // to make it feel snappier if the effect is slow
      setLocalLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to login");
      setLocalLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLocalLoading(true);
    
    if (phoneNumber.length < 10) {
      setError("Please enter a valid 10-digit phone number");
      setLocalLoading(false);
      return;
    }

    try {
      const formattedPhone = `+91${phoneNumber}`; 
      await sendOtp(formattedPhone);
      setMethod('otp');
    } catch (err: any) {
      console.error(err);
      setError("Failed to send OTP. Try again.");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLocalLoading(true);
    try {
      await verifyOtp(otp);
      setLocalLoading(false);
      // Navigation happens via useEffect
    } catch (err: any) {
      setError("Invalid OTP. Please check and try again.");
      setLocalLoading(false);
    }
  };

  // Google Icon SVG
  const GoogleIcon = () => (
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-6 h-6 mr-3 block">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
    </svg>
  );

  const isLoading = localLoading || authLoading;

  return (
    <div className="min-h-screen bg-brand-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] right-[-10%] w-80 h-80 bg-brand-500/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-brand-gold/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-24 h-24 bg-gradient-to-tr from-brand-500 to-orange-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-brand-500/40"
          >
            <span className="text-4xl font-black text-white tracking-tighter">RK</span>
          </motion.div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-white mb-2"
          >
            Welcome Back
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 font-medium"
          >
            The arena awaits your arrival
          </motion.p>
        </div>

        <Card className="backdrop-blur-md bg-brand-800/80 border-gray-700/50 shadow-2xl overflow-hidden relative min-h-[350px]">
          <AnimatePresence mode="wait">
            
            {/* --- SELECTION MODE --- */}
            {method === 'selection' && (
              <motion.div 
                key="selection"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 py-4"
              >
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center font-medium">
                    {error}
                  </div>
                )}

                {/* Real Google Button */}
                <button 
                  onClick={handleGoogleLogin} 
                  disabled={isLoading}
                  className="w-full bg-white hover:bg-gray-50 text-gray-700 font-roboto font-medium h-12 px-4 rounded-lg transition-all duration-200 flex items-center justify-center google-btn-shadow active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin text-gray-600" />
                  ) : (
                    <>
                      <GoogleIcon />
                      <span className="text-base tracking-wide">Sign in with Google</span>
                    </>
                  )}
                </button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-brand-800 text-gray-500 font-medium">OR</span>
                  </div>
                </div>

                <Button 
                  onClick={() => setMethod('phone')} 
                  variant="secondary" 
                  disabled={isLoading}
                  className="flex items-center justify-center gap-3 h-12 font-medium bg-gray-700 hover:bg-gray-600 border-0"
                >
                  <Smartphone size={20} />
                  Sign in with Phone
                </Button>
              </motion.div>
            )}

            {/* --- PHONE INPUT MODE --- */}
            {method === 'phone' && (
              <motion.div 
                key="phone"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 py-2"
              >
                <div className="flex items-center gap-2 mb-6">
                  <button onClick={() => setMethod('selection')} className="p-2 -ml-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700 transition-colors">
                    <ArrowLeft size={20} />
                  </button>
                  <h3 className="text-lg font-bold text-white">Enter Phone Number</h3>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handlePhoneSubmit} className="space-y-6">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="bg-brand-900 border border-gray-700 rounded-lg px-3 py-3 flex items-center justify-center text-gray-400 font-mono font-medium select-none">
                        🇮🇳 +91
                      </div>
                      <input 
                        type="tel" 
                        placeholder="98765 43210" 
                        value={phoneNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, ''); // Only numbers
                          if (val.length <= 10) setPhoneNumber(val);
                        }}
                        className="flex-1 bg-brand-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors font-medium tracking-wide text-lg placeholder:text-gray-600"
                        autoFocus
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 ml-1">We'll send you a 6-digit verification code.</p>
                  </div>
                  
                  <div id="recaptcha-container" className="flex justify-center"></div>
                  
                  <Button type="submit" disabled={isLoading || phoneNumber.length < 10} className="h-12 text-lg">
                    {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Get OTP'}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* --- OTP INPUT MODE --- */}
            {method === 'otp' && (
              <motion.div 
                key="otp"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 py-2"
              >
                 <div className="flex items-center gap-2 mb-2">
                  <button onClick={() => setMethod('phone')} className="p-2 -ml-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700 transition-colors">
                    <ArrowLeft size={20} />
                  </button>
                  <h3 className="text-lg font-bold text-white">Verify Phone</h3>
                </div>

                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500 mb-3 border border-green-500/20">
                    <CheckCircle size={32} />
                  </div>
                  <p className="text-gray-300 text-sm">Code sent to <span className="text-white font-mono font-bold">+91 {phoneNumber}</span></p>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleOtpVerify} className="space-y-6">
                  <div>
                    <input 
                      type="text" 
                      placeholder="• • • • • •" 
                      value={otp}
                      onChange={(e) => {
                         const val = e.target.value.replace(/\D/g, '');
                         if (val.length <= 6) setOtp(val);
                      }}
                      maxLength={6}
                      className="w-full bg-brand-900 border border-gray-700 rounded-lg px-4 py-4 text-center text-3xl font-bold tracking-[0.5em] text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-gray-700"
                      autoFocus
                    />
                  </div>
                  <Button type="submit" disabled={isLoading || otp.length < 6} className="h-12 text-lg">
                    {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Verify & Login'}
                  </Button>
                  
                  <div className="text-center">
                     <button type="button" onClick={() => setMethod('phone')} className="text-sm text-brand-500 hover:text-brand-400 font-medium">
                       Wrong number? Change it
                     </button>
                  </div>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </Card>
      </div>
      
      {/* AI Assistant available on login screen */}
      <AIAssistant />
    </div>
  );
};

export default Login;