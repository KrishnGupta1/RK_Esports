import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button, Input, Badge } from '../components/UI';
import { 
  User, Shield, Bell, Smartphone, Monitor, Globe, 
  CreditCard, Lock, LogOut, ChevronRight, Moon, 
  Volume2, Zap, RefreshCw, HelpCircle, FileText,
  Gamepad2, Camera, Mail, Edit3, Trash2, X, Save, Share2, Gift, Copy, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Reusable Setting Item Component
const SettingItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  subLabel?: string;
  action?: React.ReactNode;
  onClick?: () => void;
  isDestructive?: boolean;
}> = ({ icon, label, subLabel, action, onClick, isDestructive }) => (
  <div 
    onClick={onClick}
    className={`flex items-center justify-between p-4 border-b border-white/5 last:border-0 relative z-10 ${onClick ? 'cursor-pointer hover:bg-white/5 active:bg-white/10' : ''} transition-colors group ${isDestructive ? 'hover:bg-red-500/10' : ''}`}
  >
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
        isDestructive 
          ? 'bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white' 
          : 'bg-brand-800 text-gray-400 group-hover:text-brand-gold group-hover:bg-brand-700'
      }`}>
        {icon}
      </div>
      <div>
        <p className={`font-medium text-sm ${isDestructive ? 'text-red-500' : 'text-gray-200'}`}>{label}</p>
        {subLabel && <p className="text-[10px] text-gray-500">{subLabel}</p>}
      </div>
    </div>
    <div className="text-gray-500">
      {action || (onClick && <ChevronRight size={18} />)}
    </div>
  </div>
);

// Toggle Switch Component
const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <div 
    onClick={(e) => { e.stopPropagation(); onChange(); }}
    className={`w-11 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 relative z-20 ${checked ? 'bg-brand-500' : 'bg-gray-700'}`}
  >
    <motion.div 
      layout
      className="w-4 h-4 bg-white rounded-full shadow-md"
    />
  </div>
);

// Modal Component
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}> = ({ isOpen, onClose, title, children, icon }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }} 
          animate={{ scale: 1, y: 0 }} 
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-brand-900 w-full max-w-md rounded-2xl border border-white/10 p-6 relative overflow-hidden shadow-2xl"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 bg-white/5 rounded-full z-20"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            {icon && (
               <div className="w-10 h-10 rounded-full bg-brand-800 flex items-center justify-center text-brand-500 border border-brand-500/20">
                 {icon}
               </div>
            )}
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>
          
          <div className="relative z-10">
            {children}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const Settings: React.FC = () => {
  const { userProfile, logout, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  
  // Modals state
  const [activeModal, setActiveModal] = useState<
    'profile' | 'phone' | 'password' | 'delete' | 'refer' | 'terms' | 'ff_details' | null
  >(null);
  
  // State for toggles with persistence
  const [settings, setSettings] = useState({
    pushNotifs: true,
    emailNotifs: false,
    soundEffects: true,
    haptic: true,
    darkMode: true,
    showStats: true,
    twoFactor: false,
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('app_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const toggle = (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    localStorage.setItem('app_settings', JSON.stringify(newSettings));
  };

  // Profile Edit State
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Sync Animation State
  const [isSyncing, setIsSyncing] = useState(false);

  const handleOpenProfile = () => {
    setEditName(userProfile?.name || '');
    setEditEmail(userProfile?.email || '');
    setActiveModal('profile');
  };

  const handleOpenPhone = () => {
    setEditPhone(userProfile?.phone || '');
    setActiveModal('phone');
  };

  const handleSaveProfile = async () => {
    await updateUserProfile({ name: editName, email: editEmail });
    setActiveModal(null);
  };

  const handleSavePhone = async () => {
    await updateUserProfile({ phone: editPhone });
    setActiveModal(null);
  };

  const copyReferral = () => {
      navigator.clipboard.writeText(userProfile?.referralCode || '');
      alert("Referral Code Copied!");
  }

  const handleShare = async () => {
    try {
        if (navigator.share) {
            await navigator.share({
                title: 'Join RK Esports',
                text: `Join RK Esports using my code ${userProfile?.referralCode} and get bonus coins!`,
                url: 'https://rkesports.app'
            });
        } else {
            copyReferral();
        }
    } catch (err) {
        copyReferral();
    }
  };

  const handleSyncData = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      alert("Game data synced successfully!");
    }, 1500);
  };

  const handleResetPassword = () => {
    alert("Password reset link sent to your email!");
    setActiveModal(null);
  };

  return (
    <Layout>
      <div className="space-y-6 pb-8">
        
        {/* --- MODALS --- */}
        
        {/* Edit Profile Modal */}
        <Modal 
          isOpen={activeModal === 'profile'} 
          onClose={() => setActiveModal(null)} 
          title="Edit Profile"
          icon={<User size={20} />}
        >
           <div className="space-y-4">
              <div>
                  <label className="text-gray-400 text-xs uppercase font-bold mb-1 block">Display Name</label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div>
                  <label className="text-gray-400 text-xs uppercase font-bold mb-1 block">Email Address</label>
                  <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
              </div>
              <Button onClick={handleSaveProfile} className="mt-4">
                  <Save size={18} /> Save Changes
              </Button>
           </div>
        </Modal>

        {/* Edit Phone Modal */}
        <Modal 
          isOpen={activeModal === 'phone'} 
          onClose={() => setActiveModal(null)} 
          title="Update Phone"
          icon={<Smartphone size={20} />}
        >
           <div className="space-y-4">
              <p className="text-sm text-gray-400">Update your contact number for notifications and verification.</p>
              <div>
                  <label className="text-gray-400 text-xs uppercase font-bold mb-1 block">Phone Number</label>
                  <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="+91..." />
              </div>
              <Button onClick={handleSavePhone} className="mt-2">
                  <Save size={18} /> Update Number
              </Button>
           </div>
        </Modal>

        {/* Refer Modal */}
        <Modal 
          isOpen={activeModal === 'refer'} 
          onClose={() => setActiveModal(null)} 
          title="Refer & Earn"
          icon={<Gift size={20} />}
        >
           <div className="text-center">
               <p className="text-gray-400 text-sm mb-6">Share your code and earn <span className="text-brand-gold font-bold">100 Coins</span> for every friend who joins!</p>
               
               <div className="bg-black/40 border-2 border-dashed border-gray-700 rounded-xl p-4 mb-6">
                   <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Your Unique Code</p>
                   <h2 className="text-3xl font-mono font-bold text-white tracking-widest">{userProfile?.referralCode || 'RK2025'}</h2>
               </div>

               <div className="flex gap-3">
                   <Button onClick={copyReferral} variant="secondary" className="flex-1">
                       <Copy size={18} /> Copy
                   </Button>
                   <Button onClick={handleShare} className="flex-1">
                       <Share2 size={18} /> Share
                   </Button>
               </div>
           </div>
        </Modal>

        {/* Delete Account Modal */}
        <Modal 
          isOpen={activeModal === 'delete'} 
          onClose={() => setActiveModal(null)} 
          title="Delete Account"
          icon={<Trash2 size={20} />}
        >
           <div className="text-center">
              <p className="text-gray-300 text-sm mb-6">Are you sure? This action cannot be undone. All your coins and match history will be lost permanently.</p>
              <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => setActiveModal(null)}>Cancel</Button>
                  <Button className="bg-red-600 hover:bg-red-500 border-red-500" onClick={() => { alert("Account scheduled for deletion."); setActiveModal(null); }}>Yes, Delete</Button>
              </div>
           </div>
        </Modal>

        {/* Free Fire Details Modal */}
        <Modal 
          isOpen={activeModal === 'ff_details'} 
          onClose={() => setActiveModal(null)} 
          title="Game Details"
          icon={<Gamepad2 size={20} />}
        >
            <div className="space-y-4">
                <div className="p-4 bg-brand-800 rounded-xl border border-white/5">
                   <p className="text-xs text-gray-500 uppercase font-bold">Free Fire UID</p>
                   <p className="text-xl font-mono text-white tracking-widest">{userProfile?.ffUid || 'Not Set'}</p>
                </div>
                <div className="p-4 bg-brand-800 rounded-xl border border-white/5">
                   <p className="text-xs text-gray-500 uppercase font-bold">In-Game Name</p>
                   <p className="text-xl font-bold text-white">{userProfile?.ffName || 'Not Set'}</p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg flex gap-2 items-start">
                    <Lock size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-200">
                        These details are locked to prevent tournament fraud. If you entered them incorrectly, please contact support immediately.
                    </p>
                </div>
                <Button onClick={() => setActiveModal(null)} variant="secondary">Close</Button>
            </div>
        </Modal>

        {/* Change Password Modal */}
        <Modal 
          isOpen={activeModal === 'password'} 
          onClose={() => setActiveModal(null)} 
          title="Change Password"
          icon={<Lock size={20} />}
        >
            <div className="text-center space-y-4">
               <p className="text-sm text-gray-400">We will send a password reset link to your registered email address:</p>
               <p className="font-bold text-white">{userProfile?.email || 'No email linked'}</p>
               <Button onClick={handleResetPassword}>Send Reset Link</Button>
            </div>
        </Modal>

        {/* Terms Modal */}
        <Modal 
          isOpen={activeModal === 'terms'} 
          onClose={() => setActiveModal(null)} 
          title="Terms of Service"
          icon={<FileText size={20} />}
        >
            <div className="h-60 overflow-y-auto text-sm text-gray-400 space-y-2 pr-2">
               <p>1. By using RK Esports, you agree to fair play rules.</p>
               <p>2. Using hacks, scripts, or emulators in mobile-only matches will lead to a permanent ban.</p>
               <p>3. Entry fees are non-refundable once the match has started.</p>
               <p>4. Winnings are credited to your wallet within 1 hour of match completion.</p>
               <p>5. Withdrawals are processed within 24 hours.</p>
               <p>6. Management decision is final in case of disputes.</p>
            </div>
            <Button onClick={() => setActiveModal(null)} className="mt-4" variant="secondary">I Understand</Button>
        </Modal>

        {/* --- MAIN SETTINGS UI --- */}

        {/* Profile Header - Clickable */}
        <div className="relative pt-4">
           <div className="flex flex-col items-center">
              <div 
                className="relative group cursor-pointer active:scale-95 transition-transform" 
                onClick={handleOpenProfile}
              >
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 p-[2px] shadow-[0_0_20px_rgba(255,46,77,0.3)]">
                   <div className="w-full h-full bg-black rounded-2xl overflow-hidden relative">
                      {userProfile?.photoURL ? (
                        <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-brand-900 text-gray-500">
                          <User size={32} />
                        </div>
                      )}
                      {/* Edit Overlay */}
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <Camera size={24} className="text-white" />
                      </div>
                   </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-brand-500 text-white p-1.5 rounded-lg border-2 border-black shadow-lg z-10">
                   <Edit3 size={12} />
                </div>
              </div>
              
              <div className="text-center mt-4 cursor-pointer" onClick={handleOpenProfile}>
                  <h2 className="text-2xl font-display font-bold text-white tracking-wide flex items-center justify-center gap-2">
                    {userProfile?.name || 'User Name'}
                    <Edit3 size={14} className="text-gray-600" />
                  </h2>
                  <div className="flex items-center justify-center gap-2 mt-1">
                     <Badge color="yellow">GOLD MEMBER</Badge>
                     <span className="text-xs text-gray-500 font-mono">UID: {userProfile?.uid?.slice(0,6) || '---'}</span>
                  </div>
              </div>
           </div>
        </div>

        {/* Refer Banner */}
        <div 
            onClick={() => setActiveModal('refer')}
            className="bg-gradient-to-r from-purple-900/50 to-brand-900/50 border border-purple-500/30 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-purple-500/60 transition-colors active:scale-[0.98]"
        >
             <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
                     <Gift size={24} />
                 </div>
                 <div>
                     <h3 className="font-bold text-white text-sm">Refer & Earn</h3>
                     <p className="text-[10px] text-gray-400">Invite friends and get 100 coins</p>
                 </div>
             </div>
             <ChevronRight className="text-gray-500" />
        </div>

        {/* --- SECTION: GAME CENTER --- */}
        <div className="space-y-2">
           <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Game Center</h3>
           <Card className="!p-0 overflow-hidden bg-brand-800/50 backdrop-blur-md border border-white/5">
              <SettingItem 
                icon={<Gamepad2 size={20} />} 
                label="Free Fire Details" 
                subLabel={`UID: ${userProfile?.ffUid || 'Not Set'}`}
                onClick={() => setActiveModal('ff_details')}
              />
              <SettingItem 
                icon={<Monitor size={20} />} 
                label="Public Statistics" 
                subLabel="Show K/D and win rate to others"
                action={<Toggle checked={settings.showStats} onChange={() => toggle('showStats')} />}
                onClick={() => toggle('showStats')}
              />
              <SettingItem 
                icon={isSyncing ? <RefreshCw size={20} className="animate-spin text-brand-500" /> : <RefreshCw size={20} />} 
                label={isSyncing ? "Syncing Data..." : "Sync Game Data"}
                subLabel={isSyncing ? "Please wait" : "Last synced: Just now"}
                onClick={handleSyncData}
              />
           </Card>
        </div>

        {/* --- SECTION: ACCOUNT & SECURITY --- */}
        <div className="space-y-2">
           <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Account & Security</h3>
           <Card className="!p-0 overflow-hidden bg-brand-800/50 backdrop-blur-md border border-white/5">
              <SettingItem 
                icon={<Mail size={20} />} 
                label="Email Address" 
                subLabel={userProfile?.email || "Link Email"} 
                onClick={handleOpenProfile}
              />
              <SettingItem 
                icon={<Smartphone size={20} />} 
                label="Phone Number" 
                subLabel={userProfile?.phone || "Link Phone"} 
                onClick={handleOpenPhone}
              />
              <SettingItem 
                icon={<Lock size={20} />} 
                label="Change Password" 
                onClick={() => setActiveModal('password')}
              />
              <SettingItem 
                icon={<Shield size={20} />} 
                label="Two-Factor Auth" 
                subLabel="Extra security via OTP"
                action={<Toggle checked={settings.twoFactor} onChange={() => toggle('twoFactor')} />}
                onClick={() => toggle('twoFactor')}
              />
           </Card>
        </div>

        {/* --- SECTION: APP PREFERENCES --- */}
        <div className="space-y-2">
           <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">App Preferences</h3>
           <Card className="!p-0 overflow-hidden bg-brand-800/50 backdrop-blur-md border border-white/5">
              <SettingItem 
                icon={<Bell size={20} />} 
                label="Push Notifications" 
                action={<Toggle checked={settings.pushNotifs} onChange={() => toggle('pushNotifs')} />}
                onClick={() => toggle('pushNotifs')}
              />
              <SettingItem 
                icon={<Volume2 size={20} />} 
                label="Sound Effects" 
                action={<Toggle checked={settings.soundEffects} onChange={() => toggle('soundEffects')} />}
                onClick={() => toggle('soundEffects')}
              />
              <SettingItem 
                icon={<Zap size={20} />} 
                label="Haptic Feedback" 
                action={<Toggle checked={settings.haptic} onChange={() => toggle('haptic')} />}
                onClick={() => toggle('haptic')}
              />
              <SettingItem 
                icon={<Moon size={20} />} 
                label="Dark Mode" 
                action={<Toggle checked={settings.darkMode} onChange={() => toggle('darkMode')} />}
                onClick={() => toggle('darkMode')}
              />
           </Card>
        </div>

        {/* --- SECTION: SUPPORT & LEGAL --- */}
        <div className="space-y-2">
           <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Support</h3>
           <Card className="!p-0 overflow-hidden bg-brand-800/50 backdrop-blur-md border border-white/5">
              <SettingItem 
                icon={<HelpCircle size={20} />} 
                label="Help Center" 
                onClick={() => navigate('/support')} 
              />
              <SettingItem 
                icon={<FileText size={20} />} 
                label="Terms of Service" 
                onClick={() => setActiveModal('terms')}
              />
              <SettingItem 
                icon={<Trash2 size={20} />} 
                label="Delete Account" 
                isDestructive 
                onClick={() => setActiveModal('delete')} 
              />
           </Card>
        </div>

        {/* Logout Button */}
        <div className="pt-4">
           <Button 
             variant="outline" 
             onClick={logout}
             className="border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500/50"
           >
             <LogOut size={20} />
             Log Out
           </Button>
           <p className="text-center text-[10px] text-gray-600 mt-4 font-mono">
             Version 2.5.0 (Build 2025)
           </p>
        </div>

      </div>
    </Layout>
  );
};

export default Settings;