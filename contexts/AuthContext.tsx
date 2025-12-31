import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserProfile, Tournament, Transaction } from '../types';

// Apps Script Backend URL
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxbcjU71sjaELrdnjX_yIHlYDPJNbnOPo9telCTUDuiC8J4B8GWRzJDErYnKGMC1J3_bw/exec";

// Mock types
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
  loginWithGoogle: () => Promise<void>;
  setupRecaptcha: (elementId: string) => void;
  sendOtp: (phoneNumber: string) => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  joinTournament: (tournamentId: string) => Promise<{ success: boolean; message: string }>;
  requestDeposit: (amount: number, utr: string, method: string) => Promise<void>;
  withdrawMoney: (amount: number, upiId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// Initial Mock Tournaments with IMAGES and NEW MODES
const INITIAL_TOURNAMENTS: Tournament[] = [
  {
    id: '1',
    title: 'Grand Battle Royale #01',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    map: 'Bermuda',
    type: 'Squad',
    gameMode: 'Classic',
    entryFee: 100,
    prizePool: 2000,
    startTime: 'Today, 8:00 PM',
    status: 'open',
    joined: 8,
    slots: 48,
    perKill: 20,
    rules: ['No Hacking/Scripting', 'Teaming not allowed', 'Emulator not allowed', 'Wait for Room ID'],
    prizeDistribution: [{ rank: 1, amount: 1000 }, { rank: 2, amount: 600 }, { rank: 3, amount: 400 }],
    roomId: '',
    roomPassword: '',
    isJoined: false
  },
  {
    id: '2',
    title: 'Solo vs Squad Rush',
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80',
    map: 'Purgatory',
    type: 'Solo vs Squad',
    gameMode: 'Custom Lobby',
    entryFee: 50,
    prizePool: 1500,
    startTime: 'Today, 9:30 PM',
    status: 'open',
    joined: 12,
    slots: 48,
    perKill: 25,
    rules: ['1v4 Gameplay', 'Mobile Only'],
    prizeDistribution: [{ rank: 1, amount: 800 }, { rank: 2, amount: 400 }],
    roomId: '',
    roomPassword: '',
    isJoined: false
  },
  {
    id: '3',
    title: 'CS Ranked Tournament',
    image: 'https://images.unsplash.com/photo-1593305841991-05c29736f005?auto=format&fit=crop&w=800&q=80',
    map: 'Kalahari',
    type: 'Squad',
    gameMode: 'CS-Ranked',
    entryFee: 200,
    prizePool: 4000,
    startTime: 'Tomorrow, 6:00 PM',
    status: 'open',
    joined: 2,
    slots: 8, // 8 Teams
    perKill: 0,
    rules: ['Best of 3', 'Clash Squad Rules', 'No Grenade Spam'],
    prizeDistribution: [{ rank: 1, amount: 3000 }, { rank: 2, amount: 1000 }],
    isJoined: false
  },
  {
    id: '4',
    title: 'Solo Sniper Challenge',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
    map: 'Alpine',
    type: 'Solo',
    gameMode: 'Classic',
    entryFee: 30,
    prizePool: 600,
    startTime: 'Tomorrow, 9:00 PM',
    status: 'open',
    joined: 45,
    slots: 48,
    perKill: 15,
    rules: ['Snipers Only', 'No Melee', 'No Pistols'],
    prizeDistribution: [{ rank: 1, amount: 400 }, { rank: 2, amount: 200 }],
    isJoined: false
  }
];

// Initial Mock Transactions
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

// Helper to simulate a Database in LocalStorage
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tournaments, setTournaments] = useState<Tournament[]>(INITIAL_TOURNAMENTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);

  // Restore session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
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
            // In a real app, restore transactions/matches here from backend
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
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network

    const uid = 'mock-google-uid-123';
    const db = getMockDB();
    let profile = db[uid];

    if (!profile) {
      profile = {
        uid,
        name: 'Demo Gamer',
        email: 'demo@gmail.com',
        provider: 'google',
        coins: 100,
        role: 'user',
        status: 'active',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        photoURL: 'https://ui-avatars.com/api/?name=Demo+Gamer&background=ff2e4d&color=fff&bold=true',
        referralCode: 'RK' + Math.floor(1000 + Math.random() * 9000)
      };
      db[uid] = profile;
      saveMockDB(db);
    } else {
      profile.lastLogin = new Date().toISOString();
      db[uid] = profile;
      saveMockDB(db);
    }

    localStorage.setItem('current_session_uid', uid);
    setCurrentUser({ uid, displayName: profile.name, phoneNumber: null, photoURL: profile.photoURL || null });
    setUserProfile(profile);
    setLoading(false);
  };

  const setupRecaptcha = useCallback((elementId: string) => {
    console.log("Mock Recaptcha Initialized on", elementId);
    window.recaptchaVerifier = {
      clear: () => {},
      verify: async () => "mock-token",
      render: async () => 0
    } as any;
  }, []);

  const sendOtp = async (phoneNumber: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`OTP sent to ${phoneNumber}`);
    setLoading(false);
  };

  const verifyOtp = async (otp: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (otp === '123456') {
      const uid = 'mock-phone-uid-456';
      const db = getMockDB();
      let profile = db[uid];
      const phoneNumber = '+919876543210';

      if (!profile) {
        profile = {
          uid,
          name: 'Player ' + phoneNumber.slice(-4),
          phone: phoneNumber,
          provider: 'phone',
          coins: 50,
          role: 'user',
          status: 'active',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          photoURL: 'https://ui-avatars.com/api/?name=Mobile+Player&background=00ffa3&color=000&bold=true',
          referralCode: 'RK' + Math.floor(1000 + Math.random() * 9000)
        };
        db[uid] = profile;
        saveMockDB(db);
      } else {
        profile.lastLogin = new Date().toISOString();
        db[uid] = profile;
        saveMockDB(db);
      }

      localStorage.setItem('current_session_uid', uid);
      setCurrentUser({
        uid,
        displayName: profile.name,
        phoneNumber: phoneNumber,
        photoURL: null
      });
      setUserProfile(profile);
    } else {
      setLoading(false);
      throw new Error("Invalid OTP (Try 123456)");
    }
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    localStorage.removeItem('current_session_uid');
    setCurrentUser(null);
    setUserProfile(null);
    setLoading(false);
  };

  const refreshProfile = async () => {
    const sessionUid = localStorage.getItem('current_session_uid');
    if (sessionUid) {
      const db = getMockDB();
      const profile = db[sessionUid];
      if (profile) setUserProfile(profile);
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!userProfile) return;
    
    const newProfile = { ...userProfile, ...data };
    setUserProfile(newProfile);
    
    const db = getMockDB();
    db[userProfile.uid] = newProfile;
    saveMockDB(db);
    
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  // --- NEW: Tournament & Wallet Logic ---

  const joinTournament = async (tournamentId: string): Promise<{ success: boolean; message: string }> => {
    if (!userProfile) return { success: false, message: "Not logged in" };

    const matchIndex = tournaments.findIndex(t => t.id === tournamentId);
    if (matchIndex === -1) return { success: false, message: "Match not found" };

    const match = tournaments[matchIndex];
    
    if (match.isJoined) return { success: false, message: "Already joined!" };
    if (match.joined >= match.slots) return { success: false, message: "Match is full!" };
    if (userProfile.coins < match.entryFee) return { success: false, message: "Insufficient balance!" };

    // 1. Deduct Money
    const newBalance = userProfile.coins - match.entryFee;
    await updateUserProfile({ coins: newBalance });

    // 2. Update Tournament State locally
    const updatedTournaments = [...tournaments];
    updatedTournaments[matchIndex] = {
      ...match,
      joined: match.joined + 1,
      isJoined: true
    };
    setTournaments(updatedTournaments);

    // 3. Add Transaction Log
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      type: 'debit',
      status: 'success',
      amount: match.entryFee,
      description: `Joined: ${match.title}`,
      date: 'Just Now',
      method: 'Wallet'
    };
    setTransactions(prev => [newTx, ...prev]);

    return { success: true, message: "Joined Successfully!" };
  };

  const requestDeposit = async (amount: number, utr: string, method: string) => {
    if (!userProfile) return;
    
    // 1. Log to Apps Script
    const payload = {
        type: 'deposit_request',
        uid: userProfile.uid,
        name: userProfile.name,
        amount: amount,
        utr: utr,
        method: method,
        date: new Date().toISOString()
    };

    try {
        await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        console.error("Failed to log deposit to backend", e);
    }

    // 2. Update Local State (Pending)
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      type: 'credit',
      status: 'pending', // Pending Admin Approval
      amount: amount,
      description: `Deposit Request (UTR: ${utr})`,
      date: 'Just Now',
      method: method,
      utr: utr
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const withdrawMoney = async (amount: number, upiId: string) => {
    if (!userProfile) return;
    if (userProfile.coins < amount) throw new Error("Insufficient Balance");
    
    // 1. Log to Apps Script
    const payload = {
        type: 'withdrawal_request',
        uid: userProfile.uid,
        name: userProfile.name,
        amount: amount,
        upiId: upiId,
        date: new Date().toISOString()
    };
    
    try {
        await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(payload)
        });
    } catch (e) {
         console.error("Failed to log withdrawal", e);
    }

    // 2. Deduct Immediately from UI (Held in escrow effectively)
    const newBalance = userProfile.coins - amount;
    await updateUserProfile({ coins: newBalance });

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      type: 'debit',
      status: 'pending', // Pending admin approval
      amount: amount,
      description: `Withdrawal to ${upiId}`,
      date: 'Just Now',
      method: 'UPI'
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      userProfile, 
      loading, 
      tournaments,
      transactions,
      loginWithGoogle, 
      setupRecaptcha, 
      sendOtp,
      verifyOtp,
      logout,
      refreshProfile,
      updateUserProfile,
      joinTournament,
      requestDeposit,
      withdrawMoney
    }}>
      {children}
    </AuthContext.Provider>
  );
};

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}