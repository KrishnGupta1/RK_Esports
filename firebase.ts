
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, PhoneAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

// 🔴 IMPORTANT: REPLACE WITH YOUR FIREBASE CONFIG KEYS 🔴
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Safety check: Don't crash if keys are missing
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
  } catch (e) {
    console.error("Firebase Initialization Error:", e);
  }
} else {
  console.warn("⚠️ Firebase keys missing. App running in DEMO MODE.");
}

export { auth, db, googleProvider, phoneProvider, analytics, isConfigured };
