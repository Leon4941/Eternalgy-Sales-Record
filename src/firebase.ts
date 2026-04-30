import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

// Conditionally load the AI Studio config if it exists (prevents build errors on Netlify/external)
const appleConfigs = import.meta.glob('../firebase-applet-config.json', { eager: true });
const appleConfigKey = Object.keys(appleConfigs)[0];
const appleConfig: any = appleConfigKey ? (appleConfigs[appleConfigKey] as any).default : {};

// Use environment variables if available (for Netlify/external deployment)
// Otherwise fallback to the AI Studio applet config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || appleConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || appleConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || appleConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || appleConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || appleConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || appleConfig.appId,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || appleConfig.firestoreDatabaseId
};

// Check if we are using placeholders (which would break the app)
const isConfigValid = firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('YOUR_API_KEY');

if (!isConfigValid) {
  console.warn('Firebase configuration is missing or contains placeholders. Google Sign-In will not work.');
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error: any) {
    console.error('Login failed:', error);
    throw error;
  }
};

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
