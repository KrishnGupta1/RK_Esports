
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, PhoneAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

// 🔴 LIVE CONFIGURATION 🔴
const firebaseConfig = {
  apiKey: "AIzaSyBH1JWQVCLfFY2BEzdCUgwALvf59S3HEEo",
  authDomain: "rk-esports1.firebaseapp.com",
  databaseURL: "https://rk-esports1-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "rk-esports1",
  storageBucket: "rk-esports1.firebasestorage.app",
  messagingSenderId: "640016800272",
  appId: "1:640016800272:web:c2b86d7b11b1e6b8f04895",
  measurementId: "G-KWLLW2GN9P"
};

// Safety check: Detect if running with real keys
const isConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

let app;
let auth: Auth | null = null;
let db: Firestore | null = null;
let analytics;
let googleProvider = new GoogleAuthProvider();
let phoneProvider = null;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    phoneProvider = new PhoneAuthProvider(auth);
    
    if (typeof window !== 'undefined') {
      try {
        analytics = getAnalytics(app);
      } catch (e) {
        console.warn("Analytics failed to load", e);
      }
    }
    console.log("✅ Firebase Connected Successfully");
  } catch (e) {
    console.error("Firebase Initialization Error:", e);
  }
} else {
  console.warn("⚠️ Firebase keys missing. App running in DEMO MODE.");
}

export { auth, db, googleProvider, phoneProvider, analytics, isConfigured };
