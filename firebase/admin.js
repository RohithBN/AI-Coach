import { initializeApp as initializeAdminApp, cert, getApps as getAdminApps } from "firebase-admin/app";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK (for server-side)
const initFirebaseAdmin = () => {
    if (!getAdminApps().length) {
        initializeAdminApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
            })
        });
    }
    return {
        db: getAdminFirestore(),
    };
};

export const { db: adminDb } = initFirebaseAdmin();