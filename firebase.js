import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyB-en5kLZbLCY99GozOC4cXvUzwZIDt7v8",
  authDomain: "iompfoodbridge.firebaseapp.com",
  projectId: "iompfoodbridge",
  storageBucket: "iompfoodbridge.firebasestorage.app",
  messagingSenderId: "328213027998",
  appId: "1:328213027998:web:425e33c001513cb6672f8f",
  measurementId: "G-DQKTG64HJ5"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);