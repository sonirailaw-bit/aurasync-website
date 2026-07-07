// lib/firebase.js
//
// Firebase client SDK setup. Fill in the values below from your Firebase
// project settings (Firebase Console → Project Settings → General →
// "Your apps" → Web app → SDK setup and configuration).
//
// IMPORTANT: These values are safe to keep in the code (they're not secret —
// Firebase's security comes from Storage/Firestore rules, not from hiding
// this config). But since they're specific to your project, you need to
// replace the placeholders below with your actual values.

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB-X6OJtjij5LdigbJSaH3S6aFu7Lw_APs",
  authDomain: "aurasync-b09d2.firebaseapp.com",
  projectId: "aurasync-b09d2",
  storageBucket: "aurasync-b09d2.firebasestorage.app",
  messagingSenderId: "1097312230240",
  appId: "1:1097312230240:web:046a669b29376159331c05",
};

// Avoids re-initializing on hot reloads / multiple imports
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
