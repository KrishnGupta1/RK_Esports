import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);