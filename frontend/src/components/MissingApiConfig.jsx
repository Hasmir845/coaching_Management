import React from 'react';
import { AlertCircle } from 'lucide-react';

const MissingApiConfig = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
    <div className="max-w-lg rounded-xl border border-amber-200 bg-white p-8 shadow-sm">
      <div className="mb-4 flex items-center gap-3 text-amber-800">
        <AlertCircle size={28} />
        <h1 className="text-xl font-bold text-secondary">API সেটআপ প্রয়োজন</h1>
      </div>
      <p className="text-gray-700 leading-relaxed">
        Production-এ <code className="rounded bg-gray-100 px-1">VITE_API_URL</code> সেট করা নেই। Netlify
        (বা Vercel) সাইট সেটিংসে environment variable যোগ করুন, যেমন:
      </p>
      <pre className="mt-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-green-400">
        VITE_API_URL=https://your-backend.vercel.app/api
      </pre>
      <p className="mt-4 text-sm text-gray-600">
        তারপর frontend আবার deploy করুন। Local-এ চালাতে চাইলে{' '}
        <code className="rounded bg-gray-100 px-1">frontend/.env</code> কপি করুন (.env.example থেকে) এবং
        backend <code className="rounded bg-gray-100 px-1">npm start</code> (port 5000) চালু রাখুন।
      </p>
    </div>
  </div>
);

export default MissingApiConfig;
