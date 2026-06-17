import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBgQRy6CfULEltXEF-sovQAPKgeFrocH0Q",
  authDomain: "shg-digital-register.firebaseapp.com",
  projectId: "shg-digital-register",
  storageBucket: "shg-digital-register.firebasestorage.app",
  messagingSenderId: "363406057822",
  appId: "1:363406057822:web:ceeb226f2feb101109efcf",
  measurementId: "G-9D4ZS000JH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with offline persistence and force long-polling
// This fixes the issue where strict networks block WebSockets causing a 1-minute hang
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()}),
  experimentalForceLongPolling: true
});
export const auth = getAuth(app);

export default app;
