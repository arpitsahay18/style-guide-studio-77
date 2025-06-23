
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB6p9g8KC6gCUjmRsBLrCgukIqlM_g4cKs",
  authDomain: "brand-studio-454f3.firebaseapp.com",
  projectId: "brand-studio-454f3",
  storageBucket: "brand-studio-454f3.firebasestorage.app",
  messagingSenderId: "220708202999",
  appId: "1:220708202999:web:ec55cf0fe7b42d9f5926f2",
  measurementId: "G-EW8MYT2E9Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider, analytics };
