import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let auth, db, googleProvider;
let isFirebaseEnabled = false;

try {
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "") {
    throw new Error("Missing VITE_FIREBASE_API_KEY. Firebase features will be disabled.");
  }
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
  isFirebaseEnabled = true;
} catch (error) {
  console.warn("Firebase initialization skipped:", error.message);
  auth = null;
  db = null;
  googleProvider = null;
}

export { auth, db, googleProvider, isFirebaseEnabled };


