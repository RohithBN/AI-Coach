import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Check if any Firebase apps have been initialized
const apps = getApps();

// Initialize Firebase Admin with your service account
const app = apps.length === 0 ? initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  })
}) : apps[0];

// Get Firestore instance
export const adminDb = getFirestore(app);