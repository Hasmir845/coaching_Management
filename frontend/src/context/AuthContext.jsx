import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase';
import { subscribeAuth } from '../auth/authListener';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [adminRequestStatus, setAdminRequestStatus] = useState('none');
  const [teacherRequestStatus, setTeacherRequestStatus] = useState('none');
  const [loading, setLoading] = useState(true);

  const refreshUser = async (firebaseUser) => {
    if (!firebaseUser) return;

    try {
      const response = await api.get('/admin/me', {
        headers: { 'x-firebase-uid': firebaseUser.uid },
      });

      if (response.data) {
        setUserRole(response.data.role);
        setIsAdmin(response.data.isAdmin || response.data.role === 'admin');
        setIsTeacher(response.data.role === 'teacher');
        setAdminRequestStatus(response.data.adminRequestStatus || 'none');
        setTeacherRequestStatus(response.data.teacherRequestStatus || 'none');
      }
    } catch (error) {
      console.log('Could not fetch user role:', error.message);
    }
  };

  useEffect(() => {
    return subscribeAuth(async (firebaseUser, isReady) => {
      if (!isReady) return;
      setUser(firebaseUser);

      if (firebaseUser) {
        await refreshUser(firebaseUser);
      } else {
        setUserRole(null);
        setIsAdmin(false);
        setIsTeacher(false);
        setAdminRequestStatus('none');
        setTeacherRequestStatus('none');
      }

      setLoading(false);
    });
  }, []);

  const signInWithEmail = async (email, password) => {
    if (!auth) return { success: false, error: 'Firebase is not configured' };
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      // Create user record in backend if not exists
      const idToken = await result.user.getIdToken();
      try {
        await api.post('/admin/upsert', {
          firebaseUID: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
        });
        await refreshUser(result.user);
      } catch (dbError) {
        console.log('Could not save user to DB:', dbError.message);
      }

      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signUpWithEmail = async (email, password, extra = {}) => {
    if (!auth) return { success: false, error: 'Firebase is not configured' };
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      if (extra.displayName) {
        try {
          await updateProfile(result.user, { displayName: extra.displayName });
        } catch (profileError) {
          console.log('Could not update Firebase profile:', profileError.message);
        }
      }

      // Create user record in backend
      try {
        await api.post('/admin/upsert', {
          firebaseUID: result.user.uid,
          email: result.user.email,
          displayName: extra.displayName || result.user.displayName,
          photoURL: result.user.photoURL,
          role: extra.role,
          teacherData: extra.teacherData,
        });
        await refreshUser(result.user);
      } catch (dbError) {
        console.log('Could not save user to DB:', dbError.message);
      }

      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) return { success: false, error: 'Firebase is not configured' };
    try {
      const result = await signInWithPopup(auth, googleProvider);

      // Create user record in backend if not exists
      try {
        await api.post('/admin/upsert', {
          firebaseUID: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
        });
        await refreshUser(result.user);
      } catch (dbError) {
        console.log('Could not save user to DB:', dbError.message);
      }

      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    if (!auth) return { success: false, error: 'Firebase is not configured' };
    try {
      await firebaseSignOut(auth);
      setUserRole(null);
      setIsAdmin(false);
      setIsTeacher(false);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        isAdmin,
        isTeacher,
        adminRequestStatus,
        teacherRequestStatus,
        loading,
        auth,
        refreshUser,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
      }}
    >
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

