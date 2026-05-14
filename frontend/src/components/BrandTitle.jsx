import React from 'react';

/** Logo + title row for sidebar / mobile header. Replace `/coaching-logo.svg` in public/ to customize. */
export function BrandTitle({ title, subtitle, size = 'md' }) {
  const isSm = size === 'sm';
  return (
    <div className={`flex items-center gap-3 ${isSm ? '' : 'mb-8'}`}>
      <img
        src="/coaching-logo.svg"
        alt="Coaching logo"
        width={isSm ? 40 : 48}
        height={isSm ? 40 : 48}
        className="flex-shrink-0 rounded-xl shadow-md ring-1 ring-white/10"
      />
      <div className="min-w-0">
        <h1 className={`font-bold text-white leading-tight ${isSm ? 'text-lg' : 'text-2xl'}`}>{title}</h1>
        {subtitle ? <p className="text-xs text-gray-400 truncate mt-0.5">{subtitle}</p> : null}
      </div>
    </div>
  );
}
