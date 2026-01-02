
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserProfile, Tournament, Transaction, Advertisement, Notification } from '../types';
import { 
  auth, 
  db, 
  googleProvider, 
  phoneProvider,
  isConfigured
} from '../firebase';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  arrayUnion, 
  arrayRemove,
  increment,
  collection,
  query,
  orderBy,
  addDoc,
  runTransaction,
  where,
  limit
} from 'firebase/firestore';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

interface AuthContextType {
  currentUser: User | null;
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
  respondToTeamInvite: (fromUid: string, accept: boolean) => Promise<void>;
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

// --- FALLBACK MOCK DATA (Only used if Firebase keys are missing) ---
const MOCK_TOURNAMENTS: Tournament[] = [
  {
    id: '1', title: 'Grand Battle Royale #01', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e', map: 'Bermuda', type: 'Squad', gameMode: 'BR-Ranked', difficulty: 'Elite', entryFee: 100, prizePool: 2000, startTime: new Date(Date.now() + 7200000).toISOString(), status: 'open', joined: 41, slots: 48, perKill: 20, rules: ['No Hacking'], prizeDistribution: [{ rank: 1, amount: 1000 }], isJoined: false, organizerVerified: true
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // 1. Auth & Data Listeners
  useEffect(() => {
    if (isConfigured && auth && db) {
        // --- REAL FIREBASE MODE ---
        
        // A. Global Listeners (Tournaments, Ads, Notifications)
        const unsubTournaments = onSnapshot(query(collection(db, 'tournaments'), orderBy('startTime', 'desc')), (snap) => {
             const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tournament));
             setTournaments(list);
        });

        const unsubAds = onSnapshot(collection(db, 'advertisements'), (snap) => {
            const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Advertisement));
            setAdvertisements(list);
        });

        const unsubNotifs = onSnapshot(query(collection(db, 'notifications'), orderBy('date', 'desc'), limit(10)), (snap) => {
            const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
            setNotifications(list);
        });

        // B. Auth State Listener
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
          setCurrentUser(user);
          if (user) {
            // C. User Profile Listener
            const userDocRef = doc(db, 'users', user.uid);
            const unsubProfile = onSnapshot(userDocRef, (docSnap) => {
              if (docSnap.exists()) {
                const data = docSnap.data() as UserProfile;
                setUserProfile(data);
                
                // Map joined status to tournaments locally for UI
                // Note: In a large app, you'd query a subcollection 'joined_matches'
              } else {
                // Create Profile
                const newProfile: UserProfile = {
                  uid: user.uid,
                  name: user.displayName || 'Player',
                  email: user.email || undefined,
                  phone: user.phoneNumber || undefined,
                  provider: user.providerData[0]?.providerId === 'phone' ? 'phone' : 'google',
                  coins: 0,
                  role: 'user',
                  status: 'active',
                  createdAt: new Date().toISOString(),
                  lastLogin: new Date().toISOString(),
                  photoURL: user.photoURL,
                  referralCode: 'RK' + Math.floor(10000 + Math.random() * 90000),
                  level: 1, xp: 0, maxXp: 1000,
                  teamMembers: [], teamInvites: []
                };
                setDoc(userDocRef, newProfile).catch(console.error);
                setUserProfile(newProfile);
              }
              setLoading(false);
            }, (err) => {
              console.error("Profile sync error:", err);
              setLoading(false);
            });

            // D. User Transactions Listener
            const unsubTrans = onSnapshot(query(collection(db, `users/${user.uid}/transactions`), orderBy('date', 'desc'), limit(20)), (snap) => {
                const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
                setTransactions(list);
            });

            return () => {
                unsubProfile();
                unsubTrans();
            };
          } else {
            setUserProfile(null);
            setTransactions([]);
            setLoading(false);
          }
        });

        return () => {
            unsubTournaments();
            unsubAds();
            unsubNotifs();
            unsubscribeAuth();
        };

    } else {
        // --- DEMO MODE ---
        console.warn("Running AuthContext in DEMO MODE");
        setTournaments(MOCK_TOURNAMENTS);
        setAdvertisements([{ id: '1', imageUrl: 'https://placehold.co/600x200', active: true, title: 'Demo Ad' }]);
        const storedUser = localStorage.getItem('demo_user_logged_in');
        if (storedUser) {
            setCurrentUser({ uid: 'demo_user_123', displayName: 'Demo Player' });
            setUserProfile({ uid: 'demo_user_123', name: 'Demo Player', coins: 500, role: 'user', status: 'active', createdAt: '', lastLogin: '', provider: 'google' });
        }
        setLoading(false);
    }
  }, []);

  const loginWithGoogle = async () => {
    if (isConfigured && auth) {
        await signInWithPopup(auth, googleProvider);
    } else {
        // Mock Login
        await new Promise(r => setTimeout(r, 1000));
        setCurrentUser({ uid: 'demo_user_123', displayName: 'Demo Player' });
        setUserProfile({ uid: 'demo_user_123', name: 'Demo Player', coins: 500, role: 'user', status: 'active', createdAt: '', lastLogin: '', provider: 'google' });
        localStorage.setItem('demo_user_logged_in', 'true');
    }
  };

  const setupRecaptcha = (elementId: string) => {
    if (isConfigured && auth && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, elementId, { 'size': 'normal' });
    }
  };

  const sendOtp = async (phoneNumber: string) => {
    if (isConfigured && auth) {
        if (!window.recaptchaVerifier) throw new Error("Recaptcha not initialized");
        const confirmation = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
        setConfirmationResult(confirmation);
    } else {
        alert("Demo Mode: Use OTP 123456");
    }
  };

  const verifyOtp = async (otp: string) => {
    if (isConfigured && auth && confirmationResult) {
        await confirmationResult.confirm(otp);
    } else {
        if (otp === '123456') {
            setCurrentUser({ uid: 'demo_user_123', displayName: 'Demo Player' });
            localStorage.setItem('demo_user_logged_in', 'true');
        } else {
            throw new Error("Invalid Demo OTP");
        }
    }
  };

  const logout = async () => {
    if (isConfigured && auth) {
        await signOut(auth);
    } else {
        localStorage.removeItem('demo_user_logged_in');
        setCurrentUser(null);
        setUserProfile(null);
    }
  };

  const refreshProfile = async () => {};

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (userProfile && isConfigured && db && currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, data);
    } else if (userProfile) {
        setUserProfile({ ...userProfile, ...data });
    }
  };

  // --- JOIN TOURNAMENT (TRANSACTION SAFE) ---
  const joinTournament = async (tournamentId: string, joinType: 'Solo' | 'Team', teamNames: string[] = [], slot?: number) => {
      if (!userProfile || !currentUser) return { success: false, message: "Not logged in" };
      
      if (isConfigured && db) {
          try {
              await runTransaction(db, async (transaction) => {
                  const matchRef = doc(db, 'tournaments', tournamentId);
                  const userRef = doc(db, 'users', currentUser.uid);
                  
                  const matchSnap = await transaction.get(matchRef);
                  const userSnap = await transaction.get(userRef);
                  
                  if (!matchSnap.exists()) throw "Match does not exist!";
                  const matchData = matchSnap.data() as Tournament;
                  const userData = userSnap.data() as UserProfile;
                  
                  if (matchData.joined >= matchData.slots) throw "Match is full!";
                  if (userData.coins < matchData.entryFee) throw "Insufficient Balance!";
                  
                  // Deduct Coins
                  const newBalance = userData.coins - matchData.entryFee;
                  transaction.update(userRef, { coins: newBalance });
                  
                  // Add Transaction Record
                  const txRef = doc(collection(db, `users/${currentUser.uid}/transactions`));
                  transaction.set(txRef, {
                      id: txRef.id,
                      type: 'debit',
                      amount: matchData.entryFee,
                      description: `Joined ${matchData.title}`,
                      date: new Date().toISOString(),
                      status: 'success'
                  });
                  
                  // Update Match
                  transaction.update(matchRef, { 
                      joined: increment(1) 
                  });
                  
                  // Add to Participants Subcollection (so Admin can see who joined)
                  const partRef = doc(collection(db, `tournaments/${tournamentId}/participants`), currentUser.uid);
                  transaction.set(partRef, {
                      uid: currentUser.uid,
                      name: userData.name,
                      ffName: userData.ffName || 'N/A',
                      slot: slot || 0,
                      team: teamNames,
                      type: joinType
                  });
              });
              
              return { success: true, message: "Joined Successfully!" };
          } catch (e: any) {
              console.error(e);
              return { success: false, message: e.toString() };
          }
      } else {
          // Demo Logic
          if (userProfile.coins < 100) return { success: false, message: "Insufficient Balance" };
          setUserProfile({...userProfile, coins: userProfile.coins - 100});
          return { success: true, message: "Joined Successfully (Demo)" };
      }
  };

  // --- WALLET: REQUEST DEPOSIT ---
  const requestDeposit = async (amount: number, utr: string, method: string) => {
      if (isConfigured && db && currentUser) {
          // 1. Create global request for Admin
          await addDoc(collection(db, 'deposit_requests'), {
              uid: currentUser.uid,
              name: userProfile?.name,
              amount: amount,
              utr: utr,
              method: method,
              status: 'pending',
              date: new Date().toISOString()
          });
          
          // 2. Add local pending transaction for User
          await addDoc(collection(db, `users/${currentUser.uid}/transactions`), {
              type: 'credit',
              amount: amount,
              description: `Deposit Request (UTR: ${utr})`,
              status: 'pending',
              date: new Date().toISOString()
          });
      }
  };

  // --- WALLET: REQUEST WITHDRAW ---
  const withdrawMoney = async (amount: number, details: string, method: string) => {
      if (!userProfile || !currentUser) return;
      
      if (isConfigured && db) {
          await runTransaction(db, async (transaction) => {
              const userRef = doc(db, 'users', currentUser.uid);
              const userSnap = await transaction.get(userRef);
              const userData = userSnap.data() as UserProfile;
              
              if(userData.coins < amount) throw "Insufficient Balance";
              
              // 1. Deduct immediately (Pending State)
              transaction.update(userRef, { coins: userData.coins - amount });
              
              // 2. Create Global Request for Admin
              const reqRef = doc(collection(db, 'withdraw_requests'));
              transaction.set(reqRef, {
                  id: reqRef.id,
                  uid: currentUser.uid,
                  name: userData.name,
                  amount: amount,
                  details: details,
                  method: method,
                  status: 'pending',
                  date: new Date().toISOString()
              });
              
              // 3. Add User Transaction Log
              const txRef = doc(collection(db, `users/${currentUser.uid}/transactions`));
              transaction.set(txRef, {
                  type: 'debit',
                  amount: amount,
                  description: `Withdraw to ${method}`,
                  status: 'pending',
                  date: new Date().toISOString()
              });
          });
      }
  };

  const refreshMatchData = async (id: string) => {
      return tournaments.find(t => t.id === id) || null;
  };

  const applyPromoCode = async (code: string) => {
      // In real app, query 'promo_codes' collection
      if(code === 'RK2025') {
          await updateUserProfile({ coins: (userProfile?.coins || 0) + 50 });
          return 50;
      }
      throw new Error("Invalid Code");
  };

  // --- TEAM & SOCIAL LOGIC (Firestore) ---

  const inviteToTeam = async (targetUid: string) => {
      if (!userProfile || !isConfigured || !db || !currentUser) return;

      const targetRef = doc(db, 'users', targetUid);
      const targetSnap = await getDoc(targetRef);
      if (!targetSnap.exists()) throw new Error("User does not exist.");
      
      await updateDoc(targetRef, {
          teamInvites: arrayUnion({
              fromUid: currentUser.uid,
              leaderName: userProfile.name || 'Unknown',
              teamName: userProfile.clanTag || 'Squad'
          })
      });
  };

  const respondToTeamInvite = async (fromUid: string, accept: boolean) => {
      if (!userProfile || !currentUser || !isConfigured || !db) return;
      
      const inviteObj = userProfile.teamInvites?.find(i => i.fromUid === fromUid);
      if (!inviteObj) return;

      const myRef = doc(db, 'users', currentUser.uid);
      await updateDoc(myRef, { teamInvites: arrayRemove(inviteObj) });

      if (accept) {
          const leaderRef = doc(db, 'users', fromUid);
          
          // Add me to Leader's team
          await updateDoc(leaderRef, {
              teamMembers: arrayUnion({ uid: currentUser.uid, name: userProfile.name, role: 'Member' })
          });
          
          // Add Leader to My team
          await updateDoc(myRef, {
              teamMembers: arrayUnion({ uid: fromUid, name: 'Leader', role: 'Leader' }),
          });
      }
  };

  const removeTeamMember = async (targetUid: string) => {
      if (!userProfile || !currentUser || !isConfigured || !db) return;
      const memberObj = userProfile.teamMembers?.find(m => m.uid === targetUid);
      if(memberObj) {
           await updateDoc(doc(db, 'users', currentUser.uid), { teamMembers: arrayRemove(memberObj) });
      }
  };

  const sendFriendRequest = async (uid: string) => {
      if (isConfigured && db && currentUser) {
          await updateDoc(doc(db, 'users', currentUser.uid), { friendRequestsSent: arrayUnion(uid) });
          // Also add to their 'friendRequestsReceived' if you implement that field
      }
  };

  const removeFriend = async (uid: string) => {
      if (isConfigured && db && currentUser) {
          await updateDoc(doc(db, 'users', currentUser.uid), { friends: arrayRemove(uid) });
      }
  };

  const toggleFollow = async (uid: string) => true;
  
  const toggleLike = async (uid: string) => {
      if (isConfigured && db) {
          await updateDoc(doc(db, 'users', uid), { likes: increment(1) });
      }
      return true;
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
