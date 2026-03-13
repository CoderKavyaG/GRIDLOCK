import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

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
          setIsAdmin(idTokenResult.claims?.role === 'admin');

          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setUserProfile(userSnap.data());
          } else {
            const newProfile = {
              uid: currentUser.uid,
              displayName: currentUser.displayName || "",
              avatar: currentUser.photoURL || "",
              username: currentUser.email?.split("@")[0] || currentUser.uid.slice(0, 8),
              bio: "",
              joinedAt: new Date().toISOString(),
              gamesPlayed: 0,
              gamesWantToPlay: 0,
              gamesDropped: 0
            };
            await setDoc(userRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
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
