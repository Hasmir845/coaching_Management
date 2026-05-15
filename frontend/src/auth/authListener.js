import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

/** Single Firebase auth subscription (avoids StrictMode double-mount hangs on Netlify refresh). */
let user = undefined;
let ready = false;
const listeners = new Set();
let unsubscribeFirebase = null;
let timeoutId = null;

const AUTH_WAIT_MS = 8000;

function emit() {
  listeners.forEach((fn) => {
    try {
      fn(user, ready);
    } catch (e) {
      console.error(e);
    }
  });
}

function markReady(nextUser) {
  if (ready) return;
  ready = true;
  user = nextUser ?? null;
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
  emit();
}

function ensureSubscription() {
  if (unsubscribeFirebase) return;

  if (!auth) {
    markReady(null);
    return;
  }

  timeoutId = setTimeout(() => {
    if (!ready) {
      console.warn('Firebase auth timeout — check VITE_FIREBASE_* and authorized domains on Netlify.');
      markReady(null);
    }
  }, AUTH_WAIT_MS);

  unsubscribeFirebase = onAuthStateChanged(
    auth,
    (firebaseUser) => markReady(firebaseUser),
    (error) => {
      console.error('Firebase auth error:', error);
      markReady(null);
    }
  );
}

export function subscribeAuth(listener) {
  ensureSubscription();
  listeners.add(listener);
  if (ready) listener(user, true);
  return () => listeners.delete(listener);
}
