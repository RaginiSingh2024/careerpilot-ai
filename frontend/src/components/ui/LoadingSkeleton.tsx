import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number; className?: string }> = ({
  rows = 3,
  className = '',
}) => {
  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      <div className="h-6 bg-slate-200/80 rounded-md w-1/3" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 bg-slate-100 rounded-md w-full" style={{ width: `${95 - i * 15}%` }} />
      ))}
    </div>
  );
};

