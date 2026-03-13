import React from 'react';

export default function PageSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="h-6 bg-[#111] rounded-full animate-pulse mb-4"></div>
        <div className="h-6 bg-[#111] rounded-full animate-pulse mb-4"></div>
        <div className="h-6 bg-[#111] rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}
