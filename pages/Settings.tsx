
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button, Input, Badge, TextArea } from '../components/UI';
import { 
  User, Shield, Bell, Smartphone, Monitor, Globe, 
  CreditCard, Lock, LogOut, ChevronRight, Moon, 
  Volume2, Zap, RefreshCw, HelpCircle, FileText,
  Gamepad2, Camera, Mail, Edit3, Trash2, X, Save, Share2, Gift, Copy, CheckCircle, AlertTriangle, Users, Star, ShoppingBag, ShieldCheck, Crosshair,
  UserPlus, UserMinus, Sliders, Medal, Code, ExternalLink, Link as LinkIcon, Plus, Upload, FileBarChart, Info,
  Facebook, Twitter, Instagram, Youtube, MessageCircle, Send,
  Inbox
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Reusable Setting Item Component (Optimized for clicking)
const SettingItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  subLabel?: string;
  action?: React.ReactNode;
  onClick?: () => void;
  isDestructive?: boolean;
}> = ({ icon, label, subLabel, action, onClick, isDestructive }) => (
  <div 
    onClick={(e) => {
        if (onClick) {
            e.preventDefault();
            e.stopPropagation();
            onClick();
        }
    }}
    className={`flex items-center justify-between p-4 border-b border-white/5 last:border-0 relative z-10 ${onClick ? 'cursor-pointer hover:bg-white/5 active:bg-white/10' : ''} transition-colors group ${isDestructive ? 'hover:bg-red-500/10' : ''}`}
  >
    <div className="flex items-center gap-4 min-w-0 pointer-events-none">
      <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-colors ${
        isDestructive 
          ? 'bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white' 
          : 'bg-brand-800 text-gray-400 group-hover:text-brand-gold group-hover:bg-brand-700'
      }`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className={`font-medium text-sm truncate ${isDestructive ? 'text-red-500' : 'text-gray-200'}`}>{label}</p>
        {subLabel && <p className="text-[10px] text-gray-500 truncate">{subLabel}</p>}
      </div>
    </div>
    <div className="text-gray-500 pl-2 shrink-0">
      {action ? (
         <div onClick={(e) => e.stopPropagation()}>{action}</div>
      ) : (onClick && <ChevronRight size={18} />)}
    </div>
  </div>
);

// Toggle Switch Component (Smoother)
const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <div 
    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange(); }}
    className={`w-11 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-200 relative z-20 ${checked ? 'bg-brand-500' : 'bg-gray-700'}`}
  >
    <motion.div 
      layout
      className="w-4 h-4 bg-white rounded-full shadow-md"
      transition={{ type: "spring", stiffness: 700, damping: 30 }}
    />
  </div>
);

// Improved Modal Component
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}> = ({ isOpen, onClose, title, children, icon }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ y: "100%" }} 
          animate={{ y: 0 }} 
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-brand-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border-t sm:border border-white/10 relative overflow-hidden shadow-2xl z-10 max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header (Fixed) */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0 bg-brand-900">
             <div className="flex items-center gap-3">
                {icon && (
                   <div className="w-10 h-10 rounded-full bg-brand-800 flex items-center justify-center text-brand-500 border border-brand-500/20">
                     {icon}
                   </div>
                )}
                <h3 className="text-xl font-bold text-white">{title}</h3>
             </div>
             <button 
                onClick={onClose}
                className="text-gray-400 hover:text-white p-2 bg-white/5 rounded-full transition-colors"
             >
                <X size={20} />
             </button>
          </div>
          
          {/* Content (Scrollable) */}
          <div className="p-6 overflow-y-auto flex-1 no-scrollbar pb-24 relative z-10">
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const Settings: React.FC = () => {
  const { userProfile, logout, updateUserProfile, inviteToTeam, removeTeamMember, respondToTeamInvite } = useAuth();
  const navigate = useNavigate();
  
  // Modals state
  const [activeModal, setActiveModal] = useState<
    'profile' | 'phone' | 'password' | 'delete' | 'refer' | 'terms' | 'ff_details' | 'badges' | 'my_team' | 'friends' | 'request_stats' | 'developer' | 'social_media' | null
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

  // Developer Info State (Read Only in User App)
  const [devInfo, setDevInfo] = useState({
      name: "RK OFFICIAL",
      image: "https://i.pinimg.com/736x/2e/0f/50/2e0f50b4313d3d63c224c6e9196b6307.jpg",
      bio: "Owner of RK Esports Platform. We host daily free fire tournaments. Download our other apps below.",
      apps: [
          { name: "RK Shop", url: "https://google.com" },
          { name: "Status Saver", url: "https://google.com" }
      ]
  });
  
  const socialLinks = [
      { id: 'whatsapp', name: 'WhatsApp Group', url: 'https://chat.whatsapp.com/example', icon: <MessageCircle size={20} />, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
      { id: 'telegram', name: 'Telegram Channel', url: 'https://t.me/example', icon: <Send size={20} />, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
      { id: 'instagram', name: 'Instagram', url: 'https://instagram.com/example', icon: <Instagram size={20} />, color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
      { id: 'youtube', name: 'YouTube', url: 'https://youtube.com/example', icon: <Youtube size={20} />, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
      { id: 'facebook', name: 'Facebook', url: 'https://facebook.com/example', icon: <Facebook size={20} />, color: 'text-blue-600', bg: 'bg-blue-600/10', border: 'border-blue-600/20' },
      { id: 'twitter', name: 'Twitter (X)', url: 'https://twitter.com/example', icon: <Twitter size={20} />, color: 'text-sky-500', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
  ];
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmMemberId, setConfirmMemberId] = useState<string | null>(null);

  // Edit States
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [clanName, setClanName] = useState('');
  const [inviteUid, setInviteUid] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);
  
  // Request Stats & Achievements State
  const [requestStatsData, setRequestStatsData] = useState({
      kd: '',
      headshot: '',
      matches: '',
      wins: '',
      achievements: ''
  });
  
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('app_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    const savedDevInfo = localStorage.getItem('app_dev_info');
    if(savedDevInfo) {
        setDevInfo(JSON.parse(savedDevInfo));
    }
  }, []);
  
  useEffect(() => {
      if(userProfile?.stats) {
          setRequestStatsData(prev => ({...prev, ...userProfile.stats}));
      }
      if(userProfile?.achievements) {
          setRequestStatsData(prev => ({...prev, achievements: userProfile.achievements.join(', ')}));
      }
  }, [userProfile]);

  const toggle = (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    localStorage.setItem('app_settings', JSON.stringify(newSettings));
  };

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
  
  const handleRequestStats = async () => {
      if(!requestStatsData.kd || !requestStatsData.headshot) {
          alert("Please fill in the stats you want to display.");
          return;
      }
      setActiveModal(null);
      alert("Request Sent to Admin! \n\nStats and Achievements update requested.");
  };

  // Team Logic
  const handleUpdateClanName = async () => {
    if(!clanName.trim()) {
        alert("Enter Clan Name");
        return;
    }
    await updateUserProfile({ clanTag: clanName });
    alert("Clan Name Updated!");
  };

  const handleInviteToTeam = async () => {
    if(!inviteUid) return;
    setSendingInvite(true);
    try {
        await inviteToTeam(inviteUid);
        setInviteUid('');
        alert("Invite Sent! Wait for them to accept.");
    } catch (e: any) {
        alert(e.message);
    } finally {
        setSendingInvite(false);
    }
  };

  const handleRespondToInvite = async (fromUid: string, accept: boolean) => {
      try {
          await respondToTeamInvite(fromUid, accept);
          if (accept) alert("Joined team successfully!");
      } catch (e: any) {
          alert(e.message);
      }
  }

  const handleConfirmRemoveMember = async (uid: string) => {
      await removeTeamMember(uid);
      setConfirmMemberId(null);
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

  const handleDeleteAccount = async () => {
      setIsDeleting(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setActiveModal(null);
      setIsDeleting(false);
      alert("Account deletion scheduled successfully. You have been logged out.");
      logout();
  };

  const badges = [
      { id: 'vip', name: 'VIP Member', price: 500, color: 'purple', icon: <Star size={18} /> },
      { id: 'influencer', name: 'Influencer', price: 1000, color: 'pink', icon: <Users size={18} /> },
      { id: 'verified', name: 'Verified', price: 2000, color: 'blue', icon: <CheckCircle size={18} /> },
      { id: 'sniper', name: 'Sniper King', price: 200, color: 'green', icon: <Crosshair size={18} /> },
      { id: 'rusher', name: 'Rusher', price: 300, color: 'red', icon: <Zap size={18} /> },
  ];

  const handleBuyBadge = (badgeName: string, price: number) => {
      const phoneNumber = "916205557860";
      const message = `Hello Admin, I want to purchase the *${badgeName}* Badge for ₹${price}.\n\nMy UID: ${userProfile?.uid || 'N/A'}\nMy Name: ${userProfile?.name || 'User'}\n\nPlease send QR Code for payment.`;
      
      const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
  };

  return (
    <Layout>
      <div className="space-y-6 pb-8">
        
        {/* --- MODALS --- */}
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
        
        <Modal 
          isOpen={activeModal === 'social_media'} 
          onClose={() => setActiveModal(null)} 
          title="Follow Us"
          icon={<Globe size={20} />}
        >
           <div className="space-y-4">
               <p className="text-sm text-gray-400 text-center mb-4">
                   Join our community on other platforms for daily updates and giveaways!
               </p>
               <div className="grid grid-cols-2 gap-3">
                   {socialLinks.map((link) => (
                       <a 
                         key={link.id}
                         href={link.url}
                         target="_blank"
                         rel="noopener noreferrer"
                         className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-transform active:scale-95 hover:brightness-110 ${link.bg} ${link.border} ${link.color}`}
                       >
                           {link.icon}
                           <span className="text-xs font-bold text-white">{link.name}</span>
                       </a>
                   ))}
               </div>
           </div>
        </Modal>

        <Modal 
          isOpen={activeModal === 'request_stats'} 
          onClose={() => setActiveModal(null)} 
          title="Request Stat Update"
          icon={<FileBarChart size={20} />}
        >
           <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl flex gap-3">
                  <Info size={20} className="text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-200 leading-relaxed">
                      Enter your real in-game stats below. Admin will verify these with your uploaded profile screenshot.
                  </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="text-gray-400 text-[10px] uppercase font-bold mb-2 block">K/D RATIO</label>
                      <Input value={requestStatsData.kd} onChange={(e) => setRequestStatsData({...requestStatsData, kd: e.target.value})} placeholder="4.5" className="bg-black/30 border-white/5 focus:border-brand-500/50" />
                  </div>
                  <div>
                      <label className="text-gray-400 text-[10px] uppercase font-bold mb-2 block">HEADSHOT %</label>
                      <Input value={requestStatsData.headshot} onChange={(e) => setRequestStatsData({...requestStatsData, headshot: e.target.value})} placeholder="65" className="bg-black/30 border-white/5 focus:border-brand-500/50" />
                  </div>
                  <div>
                      <label className="text-gray-400 text-[10px] uppercase font-bold mb-2 block">BOOYAHS</label>
                      <Input value={requestStatsData.wins} onChange={(e) => setRequestStatsData({...requestStatsData, wins: e.target.value})} placeholder="10" className="bg-black/30 border-white/5 focus:border-brand-500/50" />
                  </div>
                  <div>
                      <label className="text-gray-400 text-[10px] uppercase font-bold mb-2 block">MATCHES</label>
                      <Input value={requestStatsData.matches} onChange={(e) => setRequestStatsData({...requestStatsData, matches: e.target.value})} placeholder="50" className="bg-black/30 border-white/5 focus:border-brand-500/50" />
                  </div>
              </div>
              
              <div>
                  <label className="text-gray-400 text-[10px] uppercase font-bold mb-2 block">My Achievements / Tags</label>
                  <Input 
                    value={requestStatsData.achievements} 
                    onChange={(e) => setRequestStatsData({...requestStatsData, achievements: e.target.value})} 
                    placeholder="Sharpshooter, Rusher, MVP" 
                    className="bg-black/30 border-white/5 focus:border-brand-500/50" 
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Separate tags with commas</p>
              </div>

              <div>
                  <label className="text-gray-400 text-xs uppercase font-bold mb-2 block">Upload Screenshot</label>
                  <div className="border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:text-white hover:border-brand-500/50 transition-colors cursor-pointer bg-black/20">
                      <Upload size={24} className="mb-2" />
                      <span className="text-xs font-bold">Tap to Upload Image</span>
                  </div>
              </div>

              <Button onClick={handleRequestStats} className="mt-4">
                  Submit Request
              </Button>
           </div>
        </Modal>
        
        <Modal 
          isOpen={activeModal === 'developer'} 
          onClose={() => setActiveModal(null)} 
          title="Developer Info"
          icon={<Code size={20} />}
        >
           <div className="text-center space-y-6">
               <div className="relative inline-block mt-2">
                   <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-brand-500 to-purple-600 shadow-xl mx-auto">
                       <img src={devInfo.image} alt="Developer" className="w-full h-full rounded-full object-cover border-2 border-black" />
                   </div>
                   <Badge color="red" className="absolute -bottom-2 left-1/2 -translate-x-1/2 shadow-lg">OWNER</Badge>
               </div>
               
               <div>
                   <h2 className="text-2xl font-bold text-white mb-1">{devInfo.name}</h2>
                   <p className="text-sm text-gray-400 leading-relaxed px-4">{devInfo.bio}</p>
               </div>
               
               <div className="space-y-3 bg-brand-800/30 p-4 rounded-xl border border-white/5">
                   <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">More Apps by Developer</h4>
                   {devInfo.apps.length > 0 ? (
                       devInfo.apps.map((app, idx) => (
                           <a 
                             key={idx} 
                             href={app.url} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-colors group"
                           >
                               <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded bg-brand-900 flex items-center justify-center text-brand-500">
                                       <Smartphone size={16} />
                                   </div>
                                   <span className="text-sm font-bold text-white group-hover:text-brand-gold transition-colors">{app.name}</span>
                               </div>
                               <ExternalLink size={14} className="text-gray-500 group-hover:text-white" />
                           </a>
                       ))
                   ) : (
                       <p className="text-xs text-gray-600 italic">No other apps listed.</p>
                   )}
               </div>
           </div>
        </Modal>

        {/* --- MY TEAM MODAL WITH REQUESTS --- */}
        <Modal 
          isOpen={activeModal === 'my_team'} 
          onClose={() => setActiveModal(null)} 
          title="My Team & Clan"
          icon={<Users size={20} />}
        >
           <div className="space-y-6">
              {/* Clan Name Section */}
              <div className="space-y-2">
                 <label className="text-gray-400 text-xs uppercase font-bold block">Clan / Team Name</label>
                 <div className="flex gap-2">
                    <Input 
                        value={clanName} 
                        onChange={(e) => setClanName(e.target.value)} 
                        placeholder={userProfile?.clanTag || "Set Clan Name"}
                        maxLength={15}
                    />
                    <Button onClick={handleUpdateClanName} className="w-auto px-4"><Save size={18}/></Button>
                 </div>
              </div>

              {/* PENDING INVITES SECTION */}
              {userProfile?.teamInvites && userProfile.teamInvites.length > 0 && (
                  <div className="bg-brand-800/80 border border-brand-500/30 rounded-xl p-4 animate-in slide-in-from-top-4">
                      <div className="flex items-center gap-2 mb-3">
                          <Inbox size={16} className="text-brand-500" />
                          <h4 className="text-sm font-bold text-white uppercase">Pending Invites</h4>
                      </div>
                      <div className="space-y-2">
                          {userProfile.teamInvites.map((invite, idx) => (
                              <div key={idx} className="bg-black/30 p-3 rounded-lg flex items-center justify-between border border-white/5">
                                  <div>
                                      <p className="text-xs font-bold text-white">{invite.leaderName}</p>
                                      <p className="text-[10px] text-gray-400">Invited you to: <span className="text-brand-gold">{invite.teamName}</span></p>
                                  </div>
                                  <div className="flex gap-2">
                                      <button 
                                        onClick={() => handleRespondToInvite(invite.fromUid, true)}
                                        className="bg-green-500 text-white p-1.5 rounded hover:bg-green-600 transition-colors"
                                      >
                                          <CheckCircle size={14} />
                                      </button>
                                      <button 
                                        onClick={() => handleRespondToInvite(invite.fromUid, false)}
                                        className="bg-red-500 text-white p-1.5 rounded hover:bg-red-600 transition-colors"
                                      >
                                          <X size={14} />
                                      </button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {/* Members Section */}
              <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-gray-400 text-xs uppercase font-bold">Squad Members ({userProfile?.teamMembers?.length || 1}/4)</label>
                  </div>
                  
                  <div className="bg-black/30 rounded-xl border border-white/5 overflow-hidden">
                     {(userProfile?.teamMembers || []).map((member, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-brand-800 flex items-center justify-center text-xs font-bold shrink-0">
                                    {member.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-white truncate">{member.name}</p>
                                    <p className="text-[10px] text-brand-500">{member.role}</p>
                                </div>
                            </div>
                            
                            {member.uid !== userProfile?.uid && (
                                <div className="flex items-center">
                                    {confirmMemberId === member.uid ? (
                                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-5 duration-200">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleConfirmRemoveMember(member.uid);
                                                }}
                                                className="bg-red-500 text-white text-[10px] uppercase font-bold px-3 py-1.5 rounded-lg shadow-lg shadow-red-500/20 active:scale-95 transition-all hover:bg-red-600"
                                            >
                                                Remove
                                            </button>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setConfirmMemberId(null);
                                                }}
                                                className="bg-gray-700 text-gray-300 text-[10px] uppercase font-bold px-2 py-1.5 rounded-lg active:scale-95 transition-all hover:bg-gray-600"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button 
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setConfirmMemberId(member.uid);
                                            }} 
                                            className="text-red-500 hover:bg-red-500/10 p-3 -mr-2 rounded-xl transition-colors active:scale-90 hover:text-red-400 relative z-20"
                                            title="Remove Member"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                     ))}
                     {/* Empty Slots */}
                     {Array.from({ length: 4 - (userProfile?.teamMembers?.length || 0) }).map((_, i) => (
                         <div key={`empty-${i}`} className="p-3 border-b border-white/5 last:border-0 flex items-center gap-3 opacity-50">
                             <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-dashed border-white/20">
                                 <UserPlus size={14} />
                             </div>
                             <p className="text-xs text-gray-500">Empty Slot</p>
                         </div>
                     ))}
                  </div>
              </div>

              {/* Invite Section */}
              <div className="pt-2">
                  <label className="text-gray-400 text-xs uppercase font-bold block mb-2">Invite Player</label>
                  <div className="flex gap-2">
                      <Input 
                          value={inviteUid}
                          onChange={(e) => setInviteUid(e.target.value)}
                          placeholder="Enter Player UID"
                      />
                      <Button onClick={handleInviteToTeam} disabled={sendingInvite} className="w-auto px-4 bg-brand-800 border border-white/10">
                          {sendingInvite ? 'Sending...' : 'Invite'}
                      </Button>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2 italic">
                      *Invited players must accept your request to join.
                  </p>
              </div>
           </div>
        </Modal>

        <Modal 
          isOpen={activeModal === 'friends'} 
          onClose={() => setActiveModal(null)} 
          title="My Friends"
          icon={<Users size={20} />}
        >
            <div className="space-y-4">
               {userProfile?.friends && userProfile.friends.length > 0 ? (
                   userProfile.friends.map(fid => (
                       <div key={fid} className="flex items-center justify-between p-3 bg-brand-800/50 rounded-xl border border-white/5">
                           <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                                   <User size={18} />
                               </div>
                               <div>
                                   <p className="font-bold text-white text-sm">Player_{fid.slice(0,5)}</p>
                                   <p className="text-[10px] text-green-500">Online</p>
                               </div>
                           </div>
                           <Button variant="secondary" className="w-auto py-1 px-3 text-xs h-8">Message</Button>
                       </div>
                   ))
               ) : (
                   <div className="text-center py-10 text-gray-500">
                       <UserPlus size={32} className="mx-auto mb-2 opacity-30" />
                       <p>No friends added yet.</p>
                       <p className="text-xs">Add friends from Leaderboard profiles.</p>
                   </div>
               )}
            </div>
        </Modal>

        <Modal 
          isOpen={activeModal === 'badges'} 
          onClose={() => setActiveModal(null)} 
          title="Badge Store"
          icon={<ShoppingBag size={20} />}
        >
           <div className="space-y-4">
              <div className="bg-brand-800/50 p-3 rounded-xl border border-white/5 mb-4">
                  <p className="text-xs text-gray-400 text-center">
                      Select a badge to view price. Buying opens WhatsApp with your request.
                  </p>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                  {badges.map((badge) => (
                      <div key={badge.id} className="flex items-center justify-between p-3 bg-black/40 border border-white/10 rounded-xl">
                          <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-${badge.color}-500/10 text-${badge.color}-500 border border-${badge.color}-500/30`}>
                                  {badge.icon}
                              </div>
                              <div>
                                  <h4 className="text-sm font-bold text-white">{badge.name}</h4>
                                  <p className="text-[10px] text-brand-gold font-bold">₹{badge.price}</p>
                              </div>
                          </div>
                          <button 
                            onClick={() => handleBuyBadge(badge.name, badge.price)}
                            className="bg-brand-800 hover:bg-brand-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
                          >
                              BUY
                          </button>
                      </div>
                  ))}
              </div>
           </div>
        </Modal>

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

        <Modal 
          isOpen={activeModal === 'delete'} 
          onClose={() => !isDeleting && setActiveModal(null)} 
          title="Delete Account"
          icon={<Trash2 size={20} />}
        >
           <div className="text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20 text-red-500">
                  <AlertTriangle size={32} />
              </div>
              <p className="text-white font-bold text-lg mb-2">Are you absolutely sure?</p>
              <p className="text-gray-400 text-sm mb-6">This action cannot be undone. All your coins, history, and rankings will be permanently removed from our servers.</p>
              
              <div className="flex gap-3 flex-col sm:flex-row">
                  <Button variant="secondary" onClick={() => setActiveModal(null)} disabled={isDeleting}>Cancel</Button>
                  <Button 
                    className="bg-red-600 hover:bg-red-500 border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]" 
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                  >
                      {isDeleting ? 'Deleting...' : 'Yes, Delete Account'}
                  </Button>
              </div>
           </div>
        </Modal>

        <Modal 
          isOpen={activeModal === 'ff_details'} 
          onClose={() => setActiveModal(null)} 
          title="Game Details"
          icon={<Gamepad2 size={20} />}
        >
            <div className="space-y-4">
                <div className="p-4 bg-brand-800 rounded-xl border border-white/5">
                   <p className="text-xs text-gray-500 uppercase font-bold">Free Fire UID</p>
                   <p className="text-xl font-mono text-white tracking-widest break-all">{userProfile?.ffUid || 'Not Set'}</p>
                </div>
                <div className="p-4 bg-brand-800 rounded-xl border border-white/5">
                   <p className="text-xs text-gray-500 uppercase font-bold">In-Game Name</p>
                   <p className="text-xl font-bold text-white break-all">{userProfile?.ffName || 'Not Set'}</p>
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

        <Modal 
          isOpen={activeModal === 'password'} 
          onClose={() => setActiveModal(null)} 
          title="Change Password"
          icon={<Lock size={20} />}
        >
            <div className="text-center space-y-4">
               <p className="text-sm text-gray-400">We will send a password reset link to your registered email address:</p>
               <p className="font-bold text-white break-all">{userProfile?.email || 'No email linked'}</p>
               <Button onClick={handleResetPassword}>Send Reset Link</Button>
            </div>
        </Modal>

        <Modal 
          isOpen={activeModal === 'terms'} 
          onClose={() => setActiveModal(null)} 
          title="Terms of Service"
          icon={<FileText size={20} />}
        >
            <div className="h-60 overflow-y-auto text-sm text-gray-400 space-y-2 pr-2 custom-scrollbar">
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

        {/* Profile Header */}
        <div className="relative pt-4 flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex flex-col items-center md:items-start">
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
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera size={24} className="text-white" />
                        </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-brand-500 text-white p-1.5 rounded-lg border-2 border-black shadow-lg z-10">
                    <Edit3 size={12} />
                  </div>
                </div>
            </div>
            
            <div className="text-center md:text-left flex-1 min-w-0">
                  <h2 className="text-2xl font-display font-bold text-white tracking-wide flex items-center justify-center md:justify-start gap-2 cursor-pointer" onClick={handleOpenProfile}>
                    <span className="truncate">{userProfile?.name || 'User Name'}</span>
                    <Edit3 size={14} className="text-gray-600 shrink-0" />
                  </h2>
                  <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                     <Badge color="yellow">GOLD MEMBER</Badge>
                     {userProfile?.clanTag && <Badge color="purple">{userProfile.clanTag}</Badge>}
                     <span className="text-xs text-gray-500 font-mono">UID: {userProfile?.uid?.slice(0,6) || '---'}</span>
                  </div>
                  
                  {/* Refer Banner */}
                  <div 
                      onClick={() => setActiveModal('refer')}
                      className="mt-4 bg-gradient-to-r from-purple-900/50 to-brand-900/50 border border-purple-500/30 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-purple-500/60 transition-colors active:scale-[0.98]"
                  >
                      <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
                              <Gift size={20} />
                          </div>
                          <div className="text-left">
                              <h3 className="font-bold text-white text-sm">Refer & Earn</h3>
                              <p className="text-[10px] text-gray-400">Invite friends and get 100 coins</p>
                          </div>
                      </div>
                      <ChevronRight className="text-gray-500" />
                  </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
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
                    icon={<Users size={20} />} 
                    label="My Team / Clan" 
                    subLabel={userProfile?.teamInvites?.length ? `Requests (${userProfile.teamInvites.length})` : userProfile?.teamMembers?.length ? `${userProfile.teamMembers.length} Members` : "Manage Squad"}
                    action={userProfile?.teamInvites?.length ? <Badge color="red">{userProfile.teamInvites.length} NEW</Badge> : undefined}
                    onClick={() => setActiveModal('my_team')}
                  />
                  <SettingItem 
                    icon={<FileBarChart size={20} />} 
                    label="Request Stat Update" 
                    subLabel="Update K/D & Headshot rate"
                    onClick={() => setActiveModal('request_stats')}
                  />
                  <SettingItem 
                    icon={<UserPlus size={20} />} 
                    label="My Friends" 
                    subLabel={`${userProfile?.friends?.length || 0} Connections`}
                    onClick={() => setActiveModal('friends')}
                  />
                  <SettingItem 
                    icon={<ShoppingBag size={20} />} 
                    label="Badge Store" 
                    subLabel="Buy VIP, Influencer & Titles"
                    onClick={() => setActiveModal('badges')}
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

            {/* --- SECTION: COMMUNITY & SUPPORT --- */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Community & Support</h3>
              <Card className="!p-0 overflow-hidden bg-brand-800/50 backdrop-blur-md border border-white/5">
                  <SettingItem 
                    icon={<Globe size={20} />} 
                    label="Social Media" 
                    subLabel="Join our WhatsApp, Telegram & more"
                    onClick={() => setActiveModal('social_media')} 
                  />
                  <SettingItem 
                    icon={<Code size={20} />} 
                    label="Developer Info" 
                    subLabel="Owner Details & More Apps"
                    onClick={() => setActiveModal('developer')} 
                  />
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
        </div>

        {/* Logout Button */}
        <div className="pt-4 flex justify-center md:justify-start">
           <Button 
             variant="outline" 
             onClick={logout}
             className="border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500/50 w-full md:w-auto px-10"
           >
             <LogOut size={20} />
             Log Out
           </Button>
        </div>
        <p className="text-center md:text-left text-[10px] text-gray-600 mt-2 font-mono">
           Version 2.5.0 (Build 2025)
        </p>

      </div>
    </Layout>
  );
};

export default Settings;
