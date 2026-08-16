import React from 'react';

export const NotificationStatsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-2xl border border-brand-border/70 bg-white p-5 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <div className="h-3 w-20 bg-brand-cream-dark rounded-md" />
            <div className="h-8 w-8 bg-brand-cream-dark rounded-xl" />
          </div>
          <div className="mt-3 h-8 w-14 bg-brand-cream-dark rounded-lg" />
          <div className="mt-2 h-2.5 w-28 bg-brand-cream-dark/60 rounded-md" />
        </div>
      ))}
    </div>
  );
};

export const NotificationListSkeleton = ({ count = 5 }) => {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-brand-border/70 bg-white p-5 shadow-xs"
        >
          <div className="flex items-start space-x-4 w-full sm:w-auto flex-1">
            <div className="h-11 w-11 shrink-0 rounded-xl bg-brand-cream-dark" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-36 bg-brand-cream-dark rounded-md" />
                <div className="h-4 w-16 bg-brand-cream-dark/70 rounded-full" />
              </div>
              <div className="h-3.5 w-3/4 bg-brand-cream-dark/60 rounded-md" />
              <div className="h-2.5 w-32 bg-brand-cream-dark/40 rounded-md" />
            </div>
          </div>

          <div className="flex items-center space-x-3 self-end sm:self-center">
            <div className="h-8 w-24 bg-brand-cream-dark/70 rounded-xl" />
            <div className="h-8 w-8 bg-brand-cream-dark/50 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
};
