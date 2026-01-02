
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserProfile, Tournament, Transaction, Advertisement, Notification } from '../types';
import { auth, db as firestore } from '../firebase'; // Importing real firebase configs
// NOTE: We keep the Mock Logic as fallback if Firebase keys are missing in the user's setup.

interface MockUser {
  uid: string;
  displayName: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  currentUser: MockUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  tournaments: Tournament[];
  transactions: Transaction[];
  advertisements: Advertisement[];
  notifications: Notification[];
  loginWithGoogle: () => Promise<void>;
  setupRecaptcha: (elementId: string) => void;
  sendOtp: (phoneNumber: string) => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  joinTournament: (tournamentId: string, joinType: 'Solo' | 'Team', teamNames?: string[], slot?: number) => Promise<{ success: boolean; message: string }>;
  requestDeposit: (amount: number, utr: string, method: string) => Promise<void>;
  withdrawMoney: (amount: number, details: string, method: string) => Promise<void>;
  refreshMatchData: (tournamentId: string) => Promise<Tournament | null>;
  applyPromoCode: (code: string) => Promise<number>;
  
  // Social Actions
  inviteToTeam: (uid: string) => Promise<void>;
  respondToTeamInvite: (fromUid: string, accept: boolean) => Promise<void>; // New: Accept/Reject
  removeTeamMember: (uid: string) => Promise<void>;
  sendFriendRequest: (uid: string) => Promise<void>;
  removeFriend: (uid: string) => Promise<void>;
  toggleFollow: (uid: string) => Promise<boolean>; 
  toggleLike: (uid: string) => Promise<boolean>; 
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// --- INITIAL DATA ---
const INITIAL_ADS: Advertisement[] = [
  {
    id: 'ad_1',
    imageUrl: 'https://images.unsplash.com/photo-1593305841991-05c29736f005?auto=format&fit=crop&w=800&q=80',
    link: 'https://youtube.com',
    title: 'Watch Live Stream',
    active: true
  },
  {
    id: 'ad_2',
    imageUrl: 'https://images.unsplash.com/photo-1628260412297-a3377e45006f?auto=format&fit=crop&w=800&q=80',
    link: 'https://discord.com',
    title: 'Join Discord',
    active: true
  }
];

const INITIAL_NOTIFICATIONS: Notification[] = [
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

const INITIAL_TOURNAMENTS: Tournament[] = [
  {
    id: '1',
    title: 'Grand Battle Royale #01',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    map: 'Bermuda',
    mapType: 'Day',
    serverRegion: 'IN',
    gameVersion: 'OB44',
    type: 'Squad',
    gameMode: 'BR-Ranked',
    difficulty: 'Elite',
    entryFee: 100,
    prizePool: 2000,
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    status: 'open',
    joined: 41,
    slots: 48,
    perKill: 20,
    rules: ['No Hacking/Scripting', 'Teaming not allowed', 'Emulator not allowed', 'Wait for Room ID'],
    prizeDistribution: [{ rank: 1, amount: 1000 }, { rank: 2, amount: 600 }, { rank: 3, amount: 400 }],
    roomId: '', 
    roomPassword: '',
    adminMessage: 'Room ID will be shared 15 mins before start.',
    isJoined: false,
    tags: ['Filling Fast', 'High Prize'],
    organizerVerified: true,
    deviceRestriction: 'Mobile Only'
  },
  {
    id: 'demo_live',
    title: 'CS Ranked Pro League',
    image: 'https://images.unsplash.com/photo-1593305841991-05c29736f005?auto=format&fit=crop&w=800&q=80',
    map: 'Kalahari',
    mapType: 'Day',
    serverRegion: 'IN',
    gameVersion: 'OB44',
    type: 'Squad',
    gameMode: 'CS-Ranked',
    difficulty: 'Legendary',
    entryFee: 200,
    prizePool: 4000,
    startTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // Started 15 mins ago
    status: 'ongoing',
    joined: 8,
    slots: 8, 
    perKill: 0,
    rules: ['Best of 3', 'Clash Squad Rules', 'No Grenade Spam'],
    prizeDistribution: [{ rank: 1, amount: 3000 }, { rank: 2, amount: 1000 }],
    isJoined: true, 
    myTeam: ['RK_KILLER', 'Hydra_X', 'Ninja_007', 'Slayer_OP'],
    mySlot: 4,
    joinedAs: 'Team',
    roomId: '884210', 
    roomPassword: '12', 
    youtubeLink: 'https://youtube.com',
    topFragger: 'RK_KILLER',
    topFraggerKills: 12,
    tags: ['Live Now', 'Verified'],
    organizerVerified: true,
    deviceRestriction: 'PC Allowed'
  },
  {
    id: 'svs_1',
    title: 'Solo vs Squad Rush',
    image: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&w=800&q=80',
    map: 'Purgatory',
    mapType: 'Sunset',
    serverRegion: 'IN',
    type: 'Solo vs Squad',
    gameMode: 'BR-Ranked',
    difficulty: 'Hardcore',
    entryFee: 50,
    prizePool: 1500,
    startTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    status: 'open',
    joined: 12,
    slots: 48,
    perKill: 25,
    rules: ['1v4 Logic', 'Survival Points', 'Aggressive Play'],
    prizeDistribution: [{ rank: 1, amount: 800 }, { rank: 2, amount: 400 }],
    isJoined: false,
    tags: ['Skill Based'],
    deviceRestriction: 'Mobile Only'
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { 
    id: 'tx_1', 
    type: 'credit', 
    status: 'success',
    amount: 100, 
    description: 'Welcome Bonus', 
    date: 'Today, 9:00 AM',
    method: 'Bonus'
  }
];

const getMockDB = (): Record<string, UserProfile> => {
  try {
    const db = localStorage.getItem('rk_esports_db');
    return db ? JSON.parse(db) : {};
  } catch (e) {
    return {};
  }
};

const saveMockDB = (db: Record<string, UserProfile>) => {
  localStorage.setItem('rk_esports_db', JSON.stringify(db));
};

const getSavedTournaments = (): Tournament[] => {
    try {
        const saved = localStorage.getItem('rk_tournaments_data');
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) { console.error(e); }
    return INITIAL_TOURNAMENTS;
};

const saveTournaments = (data: Tournament[]) => {
    localStorage.setItem('rk_tournaments_data', JSON.stringify(data));
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tournaments, setTournaments] = useState<Tournament[]>(INITIAL_TOURNAMENTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>(INITIAL_ADS);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  // --- REAL-TIME POLLING SIMULATION ---
  useEffect(() => {
    // 1. Initial Load
    const initAuth = async () => {
      try {
        const loadedTournaments = getSavedTournaments();
        setTournaments(loadedTournaments);

        const sessionUid = localStorage.getItem('current_session_uid');
        if (sessionUid) {
          const db = getMockDB();
          const profile = db[sessionUid];
          if (profile) {
            setCurrentUser({
              uid: profile.uid,
              displayName: profile.name,
              phoneNumber: profile.phone || null,
              photoURL: profile.photoURL || null
            });
            setUserProfile(profile);
          } else {
            localStorage.removeItem('current_session_uid');
          }
        }
      } catch (error) {
        console.error("Auth init error:", error);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const loginWithGoogle = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800)); 
      const uid = 'mock-google-uid-123';
      const db = getMockDB();
      let profile = db[uid];
      if (!profile) {
        profile = {
          uid, name: 'Demo Gamer', email: 'demo@gmail.com', provider: 'google', coins: 100, role: 'admin', status: 'active',
          createdAt: new Date().toISOString(), lastLogin: new Date().toISOString(), photoURL: 'https://ui-avatars.com/api/?name=Demo+Gamer&background=ff2e4d&color=fff&bold=true', referralCode: 'RK' + Math.floor(1000 + Math.random() * 9000),
          level: 1, xp: 0, maxXp: 1000,
          friends: [], followers: [], following: [], likes: 0, 
          teamMembers: [{ uid, name: 'Demo Gamer', role: 'Leader' }],
          teamInvites: [], // Initialize invites
          isVerified: true,
          customTag: 'RK ESPORTS OWNER',
          clanTag: 'RK OFFICIAL',
          activeBadge: { name: 'Verified', icon: 'shield', color: 'blue' },
          stats: { kd: '4.5', headshot: '65', matches: '120', wins: '40' }
        };
        db[uid] = profile; saveMockDB(db);
      }
      localStorage.setItem('current_session_uid', uid);
      setCurrentUser({ uid, displayName: profile.name, phoneNumber: null, photoURL: profile.photoURL || null });
      setUserProfile(profile);
      setLoading(false);
  };

  const setupRecaptcha = useCallback((elementId: string) => {}, []);
  const sendOtp = async (phoneNumber: string) => {};
  const verifyOtp = async (otp: string) => {};
  const logout = async () => {
    localStorage.removeItem('current_session_uid');
    setCurrentUser(null);
    setUserProfile(null);
  };
  const refreshProfile = async () => {};

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!userProfile) return;
    const newProfile = { ...userProfile, ...data };
    setUserProfile(newProfile);
    const db = getMockDB();
    db[userProfile.uid] = newProfile;
    saveMockDB(db);
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const refreshMatchData = async (tournamentId: string): Promise<Tournament | null> => {
     await new Promise(resolve => setTimeout(resolve, 500)); 
     const match = tournaments.find(t => t.id === tournamentId);
     return match || null;
  };

  const joinTournament = async (tournamentId: string, joinType: 'Solo' | 'Team', teamNames: string[] = [], slotPreference?: number): Promise<{ success: boolean; message: string }> => {
    if (!userProfile) return { success: false, message: "Not logged in" };

    const matchIndex = tournaments.findIndex(t => t.id === tournamentId);
    if (matchIndex === -1) return { success: false, message: "Match not found" };

    const match = tournaments[matchIndex];
    const slotsNeeded = joinType === 'Team' ? (1 + teamNames.length) : 1;
    const totalCost = match.entryFee * slotsNeeded;

    if (match.isJoined) return { success: false, message: "Already joined!" };
    if (match.joined + slotsNeeded > match.slots) return { success: false, message: "Not enough slots available!" };
    if (userProfile.coins < totalCost) return { success: false, message: `Insufficient balance! You need ₹${totalCost}` };

    let newXp = (userProfile.xp || 0) + 100;
    let newLevel = userProfile.level || 1;
    let max = userProfile.maxXp || 1000;
    if (newXp >= max) {
        newLevel += 1;
        newXp = newXp - max;
        max = Math.floor(max * 1.5);
    }

    const newBalance = userProfile.coins - totalCost;
    await updateUserProfile({ coins: newBalance, xp: newXp, level: newLevel, maxXp: max });

    const updatedTournaments = [...tournaments];
    const assignedSlot = slotPreference || Math.floor(Math.random() * match.slots) + 1;
    
    updatedTournaments[matchIndex] = {
      ...match,
      joined: match.joined + slotsNeeded, 
      isJoined: true,
      myTeam: joinType === 'Team' ? teamNames : [],
      joinedAs: joinType,
      mySlot: assignedSlot,
      roomId: match.roomId || "", 
      roomPassword: match.roomPassword || ""
    };
    
    setTournaments(updatedTournaments);
    saveTournaments(updatedTournaments);

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      type: 'debit',
      status: 'success',
      amount: totalCost,
      description: `Joined: ${match.title}`,
      date: 'Just Now',
      method: 'Wallet'
    };
    setTransactions(prev => [newTx, ...prev]);

    return { success: true, message: "Joined Successfully!" };
  };

  const requestDeposit = async (amount: number, utr: string, method: string) => {
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      type: 'credit',
      status: 'pending', 
      amount: amount,
      description: `Deposit (UTR: ${utr})`,
      date: 'Just Now',
      method: method,
      utr: utr
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const withdrawMoney = async (amount: number, details: string, method: string) => {
    if (!userProfile) return;
    if (userProfile.coins < amount) throw new Error("Insufficient Balance");
    
    const newBalance = userProfile.coins - amount;
    await updateUserProfile({ coins: newBalance });
    
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      type: 'debit',
      status: 'pending', 
      amount: amount,
      description: `Withdraw to ${method}`,
      date: 'Just Now',
      method: method
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const applyPromoCode = async (code: string): Promise<number> => {
      if(!userProfile) return 0;
      await new Promise(r => setTimeout(r, 1000)); 
      if (code.toUpperCase() === "RK2025") {
          const bonus = 50;
          await updateUserProfile({ coins: userProfile.coins + bonus });
          setTransactions(prev => [{
            id: `promo_${Date.now()}`,
            type: 'credit',
            status: 'success',
            amount: bonus,
            description: `Promo: ${code}`,
            date: "Just Now",
            method: "Coupon"
          }, ...prev]);
          return bonus;
      }
      throw new Error("Invalid or Expired Code");
  };

  // --- SOCIAL / TEAM FUNCTIONS ---

  // REPLACED: Logic to SEND REQUEST instead of auto-add
  const inviteToTeam = async (targetUid: string) => {
      await new Promise(r => setTimeout(r, 800)); // Simulate Network Delay
      if (!userProfile) return;

      const db = getMockDB();
      const targetUser = db[targetUid];

      // 1. Check if user exists (Real User Validation)
      if (!targetUser) {
          throw new Error("User with this UID does not exist.");
      }

      // 2. Check if already in team
      const myTeam = userProfile.teamMembers || [];
      if (myTeam.find(m => m.uid === targetUid)) {
          throw new Error("User is already in your team.");
      }
      
      // 3. Check if invite already sent
      const pendingInvites = targetUser.teamInvites || [];
      if (pendingInvites.find(i => i.fromUid === userProfile.uid)) {
          throw new Error("Invite already sent to this player.");
      }

      // 4. Send Invite (Update Target User DB)
      const newInvite = {
          fromUid: userProfile.uid,
          leaderName: userProfile.name,
          teamName: userProfile.clanTag || 'Squad'
      };
      
      targetUser.teamInvites = [...pendingInvites, newInvite];
      db[targetUid] = targetUser;
      saveMockDB(db);
      
      // We don't update local userProfile because nothing changed for us yet
  };

  // NEW: Accept or Reject Invite
  const respondToTeamInvite = async (fromUid: string, accept: boolean) => {
      if (!userProfile) return;
      
      const db = getMockDB();
      const leaderUser = db[fromUid];
      
      // Remove the invite
      const newInvites = (userProfile.teamInvites || []).filter(i => i.fromUid !== fromUid);
      
      if (accept) {
          if (!leaderUser) throw new Error("Team leader account deleted.");
          
          // Add self to Leader's team
          const leaderTeam = leaderUser.teamMembers || [];
          if (leaderTeam.length >= 4) throw new Error("Team is full.");
          
          leaderTeam.push({
              uid: userProfile.uid,
              name: userProfile.name,
              role: 'Member'
          });
          leaderUser.teamMembers = leaderTeam;
          
          // Add leader to My team list (Mirrored for simplicity in this mock)
          // In real DB, you'd usually have a separate 'Teams' collection
          const myTeam = userProfile.teamMembers || [];
          myTeam.push({
              uid: leaderUser.uid,
              name: leaderUser.name,
              role: 'Leader'
          });

          await updateUserProfile({ teamInvites: newInvites, teamMembers: myTeam, clanTag: leaderUser.clanTag });
          
          db[fromUid] = leaderUser;
          saveMockDB(db);
      } else {
          // Just remove invite
          await updateUserProfile({ teamInvites: newInvites });
      }
  };

  const removeTeamMember = async (uid: string) => {
      if (!userProfile) return;
      const newTeam = (userProfile.teamMembers || []).filter(m => m.uid !== uid);
      await updateUserProfile({ teamMembers: newTeam });
  };

  const sendFriendRequest = async (uid: string) => {
      await new Promise(r => setTimeout(r, 500));
      if (!userProfile) return;
      
      const currentSent = userProfile.friendRequestsSent || [];
      if(!currentSent.includes(uid)) {
          await updateUserProfile({ friendRequestsSent: [...currentSent, uid] });
      }
  };

  const removeFriend = async (uid: string) => {
     await new Promise(r => setTimeout(r, 500));
     if (!userProfile) return;
     const newFriends = (userProfile.friends || []).filter(f => f !== uid);
     await updateUserProfile({ friends: newFriends });
  };

  const toggleFollow = async (uid: string) => {
      await new Promise(r => setTimeout(r, 300));
      if (!userProfile) return false;
      const following = userProfile.following || [];
      const isFollowing = following.includes(uid);
      let newFollowing;
      if (isFollowing) {
          newFollowing = following.filter(id => id !== uid);
      } else {
          newFollowing = [...following, uid];
      }
      await updateUserProfile({ following: newFollowing });
      return !isFollowing;
  };

  const toggleLike = async (uid: string) => {
      // Simulate backend persistence via LocalStorage for "Liked Users" list
      await new Promise(r => setTimeout(r, 200));
      
      const storedLikes = localStorage.getItem('my_liked_users');
      let likedList = storedLikes ? JSON.parse(storedLikes) : [];
      
      const isLiked = likedList.includes(uid);
      if(!isLiked) {
          likedList.push(uid);
          localStorage.setItem('my_liked_users', JSON.stringify(likedList));
          return true; // Liked successfully
      }
      return false; // Already liked
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      userProfile, 
      loading, 
      tournaments,
      transactions,
      advertisements,
      notifications,
      loginWithGoogle, 
      setupRecaptcha, 
      sendOtp,
      verifyOtp,
      logout,
      refreshProfile,
      updateUserProfile,
      joinTournament,
      requestDeposit,
      withdrawMoney,
      refreshMatchData,
      applyPromoCode,
      inviteToTeam,
      respondToTeamInvite,
      removeTeamMember,
      sendFriendRequest,
      removeFriend,
      toggleFollow,
      toggleLike
    }}>
      {children}
    </AuthContext.Provider>
  );
};
