import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const LoadErrorBanner = ({ message, onRetry }) => (
  <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex gap-3">
        <AlertCircle className="shrink-0 mt-0.5" size={22} />
        <p className="text-sm leading-relaxed">{message}</p>
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-800 px-4 py-2 text-sm font-medium text-white hover:bg-amber-900 shrink-0"
        >
          <RefreshCw size={16} />
          আবার চেষ্টা
        </button>
      ) : null}
    </div>
  </div>
);

export default LoadErrorBanner;
