import React from 'react';

/** In-layout loader (sidebar/header stay visible on refresh). */
const PageLoader = ({ label = 'Loading…' }) => (
  <div className="flex flex-col items-center justify-center py-24 px-4">
    <div
      className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"
      aria-hidden
    />
    <p className="mt-4 text-lg font-medium text-gray-600">{label}</p>
  </div>
);

export default PageLoader;
