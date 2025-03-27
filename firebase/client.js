import { initializeApp as initializeClientApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD8Zj-bKJzloKJzloXJuO2ihwbJlMv35mDY",
    authDomain: "opus-ai-b131b.firebaseapp.com",
    projectId: "opus-ai-b131b",
    storageBucket: "opus-ai-b131b.appspot.com",
    messagingSenderId: "703100813447",
    appId: "1:703100813447:web:1e8feb64b922761c807822"
};

// Initialize Firebase Client SDK (for frontend)
const app = !getApps().length ? initializeClientApp(firebaseConfig) : getApp();

export const db = getFirestore(app); // Client-side Firestore instance