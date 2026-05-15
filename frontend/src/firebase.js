import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirebaseConfig, isFirebaseConfigured } from './config/firebaseConfig';

let app = null;
let auth = null;
let googleProvider = null;

if (isFirebaseConfigured()) {
  app = initializeApp(getFirebaseConfig());
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
}

export { auth, googleProvider, isFirebaseConfigured };
