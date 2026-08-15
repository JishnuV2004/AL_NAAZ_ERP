import React from 'react';

// Spinner component matching gold/brown theme
const GoldSpinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div
      className={`${sizeClasses[size]} animate-spin rounded-full border-brand-gold-light border-t-brand-gold`}
    />
  );
};

// 1. Full Screen Overlay Loader
export const FullScreenLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-brand-brown bg-opacity-70 backdrop-blur-sm">
      <GoldSpinner size="lg" />
      <span className="mt-4 font-sans text-brand-gold-light text-sm font-medium tracking-wider uppercase animate-pulse">
        {message}
      </span>
    </div>
  );
};

// 2. Dashboard Page Container Loader
export const PageLoader = () => {
  return (
    <div className="flex h-96 w-full items-center justify-center">
      <div className="flex flex-col items-center">
        <GoldSpinner size="md" />
        <span className="mt-2 text-xs font-semibold uppercase tracking-wider text-brand-text-muted">
          Loading Data...
        </span>
      </div>
    </div>
  );
};

// 3. Small inline loader inside button submissions
export const ButtonLoader = () => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <GoldSpinner size="sm" />
      <span>Processing...</span>
    </div>
  );
};

// 4. Skeleton box loader for grid layout placeholders
export const SkeletonLoader = ({ count = 4, type = 'card' }) => {
  const skeletons = Array.from({ length: count });

  if (type === 'table') {
    return (
      <div className="w-full space-y-4 animate-pulse">
        <div className="h-10 bg-brand-cream-dark rounded-md w-full" />
        {skeletons.map((_, i) => (
          <div key={i} className="h-12 bg-brand-cream-dark/50 rounded-md w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
      {skeletons.map((_, i) => (
        <div
          key={i}
          className="h-28 bg-white border border-brand-border rounded-2xl p-6 flex flex-col justify-between"
        >
          <div className="h-4 bg-brand-cream-dark rounded w-2/3" />
          <div className="h-8 bg-brand-cream-dark rounded w-1/2" />
        </div>
      ))}
    </div>
  );
};
