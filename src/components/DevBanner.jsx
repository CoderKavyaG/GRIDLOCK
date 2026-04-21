import React from 'react';

export const DevBanner = ({ show }) => {
  if (!show) return null;

  return (
    <div className="w-full bg-yellow-500/10 border-b border-yellow-500/30 px-4 py-2 flex items-center justify-center gap-2">
      <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
      <p className="text-sm text-yellow-600 font-medium">
        🔌 API connection issue detected - using mock data for development
      </p>
    </div>
  );
};
