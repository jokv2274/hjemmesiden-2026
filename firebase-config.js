// Fyll inn dine egne verdier fra Firebase Console → Prosjektinnstillinger → Dine apper (Web-app)
// Disse verdiene er trygge å ha i klartekst i klientkoden – sikkerheten styres av
// Firebase Authentication + Firestore/Storage-reglene, ikke av å skjule denne filen.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyApl-ShuWJvKSNR_53BKSbdm34TQ4f2SlA",
  authDomain: "hjemmeside-2026.firebaseapp.com",
  projectId: "hjemmeside-2026",
  storageBucket: "hjemmeside-2026.firebasestorage.app",
  messagingSenderId: "906142579432",
  appId: "1:906142579432:web:b9576b970e2cd49f77a75d",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
