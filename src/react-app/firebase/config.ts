// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBesCGFzvzKWHWW-RfNvjTwZPlzESb_EqE",
  authDomain: "unimarevents.firebaseapp.com",
  projectId: "unimarevents",
  storageBucket: "unimarevents.firebasestorage.app",
  messagingSenderId: "805955244979",
  appId: "1:805955244979:web:743d43b2db8039579231c6",
  measurementId: "G-7E4BW96FYC",
  databaseURL: "https://unimarevents-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);
export const analytics = getAnalytics(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;