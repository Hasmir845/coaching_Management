import React from 'react';
import { AlertCircle } from 'lucide-react';

const MissingFirebaseConfig = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
    <div className="max-w-lg rounded-xl border border-amber-200 bg-white p-8 shadow-sm">
      <div className="mb-4 flex items-center gap-3 text-amber-800">
        <AlertCircle size={28} />
        <h1 className="text-xl font-bold text-secondary">Firebase সেটআপ প্রয়োজন</h1>
      </div>
      <p className="text-gray-700 leading-relaxed mb-4">
        Netlify-এ নিচের environment variables সেট করে <strong>frontend আবার deploy</strong> করুন:
      </p>
      <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1 mb-4">
        <li>VITE_FIREBASE_API_KEY</li>
        <li>VITE_FIREBASE_AUTH_DOMAIN</li>
        <li>VITE_FIREBASE_PROJECT_ID</li>
        <li>VITE_FIREBASE_STORAGE_BUCKET</li>
        <li>VITE_FIREBASE_MESSAGING_SENDER_ID</li>
        <li>VITE_FIREBASE_APP_ID</li>
      </ul>
      <p className="text-sm text-gray-600">
        Firebase Console → Authentication → Settings → <strong>Authorized domains</strong> → আপনার{' '}
        <code className="rounded bg-gray-100 px-1">*.netlify.app</code> ডোমেইন যোগ করুন।
      </p>
    </div>
  </div>
);

export default MissingFirebaseConfig;
