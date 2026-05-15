import React from 'react';
import { apiBaseURL } from '../services/api';
import { isFirebaseConfigured } from '../firebase';

/** Shown on login when production build may be misconfigured (env baked at deploy time). */
const SetupDiagnostics = () => {
  if (import.meta.env.DEV) return null;

  const firebaseOk = isFirebaseConfigured();
  const apiOk = Boolean(apiBaseURL);
  const apiHost = (() => {
    try {
      return new URL(apiBaseURL, window.location.origin).host;
    } catch {
      return apiBaseURL;
    }
  })();

  if (firebaseOk && apiOk) return null;

  return (
    <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-left text-sm text-amber-950">
      <p className="font-semibold mb-2">সেটআপ চেক (Netlify redeploy প্রয়োজন)</p>
      <ul className="space-y-1 list-disc pl-5">
        <li>
          Firebase env:{' '}
          {firebaseOk ? (
            <span className="text-green-700">OK</span>
          ) : (
            <span className="text-red-700">মিসিং — সব VITE_FIREBASE_* সেট করে redeploy করুন</span>
          )}
        </li>
        <li>
          API:{' '}
          {apiOk ? (
            <span className="text-green-700">OK ({apiHost})</span>
          ) : (
            <span className="text-red-700">মিসিং — VITE_API_URL সেট করুন</span>
          )}
        </li>
      </ul>
    </div>
  );
};

export default SetupDiagnostics;
