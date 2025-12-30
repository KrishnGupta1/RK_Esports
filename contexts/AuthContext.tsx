import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  setupRecaptcha: (elementId: string) => void;
  sendOtp: (phoneNumber: string) => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // Helper to sync/create user in Firestore
  const syncUser = async (user: FirebaseUser, provider: 'google' | 'phone') => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Create new user document
      const newUser: Omit<UserProfile, 'createdAt' | 'lastLogin'> & { createdAt: any, lastLogin: any } = {
        uid: user.uid,
        name: user.displayName || 'Player',
        phone: user.phoneNumber || null,
        provider,
        coins: 0,
        role: 'user',
        status: 'active',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        photoURL: user.photoURL,
        // ffUid and ffName are intentionally missing here, handled in ProfileSetup
      };
      await setDoc(userRef, newUser);
      setUserProfile(newUser as UserProfile);
    } else {
      // Update last login
      await updateDoc(userRef, { lastLogin: serverTimestamp() });
      setUserProfile(userSnap.data() as UserProfile);
    }
  };

  const refreshProfile = async () => {
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserProfile(userSnap.data() as UserProfile);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // If we just reloaded, fetch the profile without creating (creation happens on login action usually, but safe to check here)
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserProfile(userSnap.data() as UserProfile);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    await syncUser(result.user, 'google');
  };

  const setupRecaptcha = (elementId: string) => {
    // Always clear existing verifier to avoid stale DOM references
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        console.warn('Failed to clear recaptcha', e);
      }
      window.recaptchaVerifier = undefined as any;
    }
    
    window.recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
      'size': 'invisible',
    });
  };

  const sendOtp = async (phoneNumber: string) => {
    if (!window.recaptchaVerifier) throw new Error("Recaptcha not initialized");
    const result = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
    setConfirmationResult(result);
  };

  const verifyOtp = async (otp: string) => {
    if (!confirmationResult) throw new Error("No OTP sent");
    const result = await confirmationResult.confirm(otp);
    await syncUser(result.user, 'phone');
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
    setCurrentUser(null);
    // Cleanup verifier on logout just in case
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        console.error(e);
      }
      window.recaptchaVerifier = undefined as any;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      userProfile, 
      loading, 
      loginWithGoogle, 
      setupRecaptcha, 
      sendOtp,
      verifyOtp,
      logout,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Add types to window
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}