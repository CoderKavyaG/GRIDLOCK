import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { generateRandomProfile } from "../utils/profileGenerator";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          // Force refresh token to ensure custom claims are up to date.
          await currentUser.getIdToken(true);
          const idTokenResult = await currentUser.getIdTokenResult();
          
          // Check for admin role via custom claims or hardcoded admin email
          const hasAdminClaim = idTokenResult.claims?.role === 'admin';
          const isAdminEmail = currentUser.email === 'codecraftkavya@gmail.com';
          setIsAdmin(hasAdminClaim || isAdminEmail);

          try {
            const userRef = doc(db, "users", currentUser.uid);
            
            try {
              const userSnap = await getDoc(userRef);

              if (userSnap.exists()) {
                const profile = userSnap.data();
                setUserProfile(profile);

                // Check if user is banned
                if (profile.banned) {
                  await firebaseSignOut(auth);
                  setUser(null);
                  setUserProfile(null);
                  setIsAdmin(false);
                  return;
                }
              } else {
                // Generate random username and avatar for new users
                const { username: randomUsername, avatar: randomAvatar } = generateRandomProfile();
                
                const newProfile = {
                  uid: currentUser.uid,
                  displayName: currentUser.displayName || randomUsername,
                  avatar: currentUser.photoURL || randomAvatar,
                  username: randomUsername,
                  bio: "",
                  joinedAt: new Date().toISOString(),
                  gamesPlayed: 0,
                  gamesWantToPlay: 0,
                  gamesDropped: 0
                };
                await setDoc(userRef, newProfile);
                setUserProfile(newProfile);
              }
            } catch (readError) {
              if (readError.code === 'permission-denied') {
                const { username: randomUsername, avatar: randomAvatar } = generateRandomProfile();
                const minimalProfile = {
                  uid: currentUser.uid,
                  displayName: currentUser.displayName || randomUsername,
                  avatar: currentUser.photoURL || randomAvatar,
                  username: randomUsername
                };
                setUserProfile(minimalProfile);
              } else {
                throw readError;
              }
            }
          } catch (firestoreError) {
            console.warn("Firestore profile fetch failed (non-critical):", firestoreError.code);
            const { username: randomUsername, avatar: randomAvatar } = generateRandomProfile();
            setUserProfile({
              uid: currentUser.uid,
              displayName: currentUser.displayName || randomUsername,
              avatar: currentUser.photoURL || randomAvatar,
              username: randomUsername,
              bio: "",
              joinedAt: new Date().toISOString(),
              gamesPlayed: 0,
              gamesWantToPlay: 0,
              gamesDropped: 0
            });
          }
        } catch (error) {
          console.error("Auth error:", error);
          setIsAdmin(false);
        }
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signOut = () => {
    return firebaseSignOut(auth);
  };

  const value = {
    user,
    userProfile,
    isAdmin,
    loading,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
