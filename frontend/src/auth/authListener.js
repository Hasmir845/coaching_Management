import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

/** Single Firebase auth subscription (Netlify refresh-safe). */
let user = null;
let ready = false;
const listeners = new Set();
let unsubscribeFirebase = null;
let timeoutId = null;

const AUTH_WAIT_MS = 12000;

function emit() {
  listeners.forEach((fn) => {
    try {
      fn(user, ready);
    } catch (e) {
      console.error(e);
    }
  });
}

function setAuthUser(firebaseUser) {
  user = firebaseUser ?? null;
  if (!ready) {
    ready = true;
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }
  emit();
}

function ensureSubscription() {
  if (unsubscribeFirebase) return;

  if (!auth) {
    ready = true;
    user = null;
    emit();
    return;
  }

  timeoutId = setTimeout(() => {
    if (!ready) {
      console.warn(
        'Firebase auth timeout — check VITE_FIREBASE_* on Netlify and Authorized domains in Firebase Console.'
      );
      setAuthUser(null);
    }
  }, AUTH_WAIT_MS);

  unsubscribeFirebase = onAuthStateChanged(
    auth,
    (firebaseUser) => setAuthUser(firebaseUser),
    (error) => {
      console.error('Firebase auth error:', error);
      setAuthUser(null);
    }
  );
}

export function subscribeAuth(listener) {
  ensureSubscription();
  listeners.add(listener);
  if (ready) listener(user, true);
  return () => listeners.delete(listener);
}
