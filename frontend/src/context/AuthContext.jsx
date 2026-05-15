import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  googleProvider
} from '../firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut
} from 'firebase/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let settled = false;

    const finish = (currentUser) => {
      if (settled) return;
      settled = true;
      setUser(currentUser);
      setLoading(false);
    };

    const timeoutId = setTimeout(() => {
      if (!settled) {
        console.warn(
          'Firebase auth did not respond in time. Check VITE_FIREBASE_* in .env (local) or site build settings (Netlify).'
        );
        finish(null);
      }
    }, 10000);

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        clearTimeout(timeoutId);
        finish(currentUser);
      },
      (error) => {
        console.error('Firebase auth error:', error);
        clearTimeout(timeoutId);
        finish(null);
      }
    );

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  // Email/Password Sign In
  const signInWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Email/Password Sign Up
  const signUpWithEmail = async (email, password) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Google Sign In
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Sign Out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      auth,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
