import React, { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { apiBaseURL } from '../services/api';
import api from '../services/api';

/** Probes backend on load — surfaces CORS / wrong VITE_API_URL on Netlify. */
const ApiConnectionBanner = () => {
  const [status, setStatus] = useState('checking');
  const [detail, setDetail] = useState('');

  const check = async () => {
    setStatus('checking');
    setDetail('');
    try {
      const res = await api.get('/health', { timeout: 15000 });
      if (res.data?.status) {
        setStatus('ok');
        return;
      }
      setStatus('error');
      setDetail('API সাড়া দিয়েছে কিন্তু health ঠিক নয়।');
    } catch (err) {
      setStatus('error');
      const msg = err.response?.data?.message || err.message || 'Unknown error';
      setDetail(
        `${msg} — API: ${apiBaseURL}. Vercel-এ FRONTEND_URL = আপনার Netlify URL (custom domain হলে সেটাও) দিন, তারপর Vercel + Netlify redeploy।`
      );
    }
  };

  useEffect(() => {
    if (!import.meta.env.DEV) check();
  }, []);

  if (import.meta.env.DEV || status === 'ok' || status === 'checking') return null;

  return (
    <div className="mx-4 mt-4 md:mx-8 md:mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <AlertCircle className="shrink-0 mt-0.5" size={22} />
          <div>
            <p className="font-semibold text-sm">ব্যাকএন্ডে ডেটা আসছে না</p>
            <p className="text-sm mt-1 leading-relaxed">{detail}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={check}
          className="inline-flex items-center gap-2 rounded-lg bg-red-800 px-3 py-2 text-sm text-white hover:bg-red-900 shrink-0"
        >
          <RefreshCw size={16} />
          আবার চেষ্টা
        </button>
      </div>
    </div>
  );
};

export default ApiConnectionBanner;
