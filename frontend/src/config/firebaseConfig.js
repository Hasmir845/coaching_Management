function envStr(key) {
  const v = import.meta.env[key];
  if (v == null) return '';
  return String(v).trim();
}

/** Strip https:// from authDomain — common Netlify copy-paste mistake. */
function normalizeAuthDomain(raw) {
  if (!raw) return '';
  return raw.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
}

/** Build-time Firebase env (Netlify must set all VITE_FIREBASE_* before deploy). */
export function getFirebaseConfig() {
  return {
    apiKey: envStr('VITE_FIREBASE_API_KEY'),
    authDomain: normalizeAuthDomain(envStr('VITE_FIREBASE_AUTH_DOMAIN')),
    projectId: envStr('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: envStr('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: envStr('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: envStr('VITE_FIREBASE_APP_ID'),
  };
}

export function isFirebaseConfigured() {
  const c = getFirebaseConfig();
  return Boolean(c.apiKey && c.authDomain && c.projectId && c.appId);
}
