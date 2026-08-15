import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-cream px-4 text-center">
      <span className="text-6xl text-brand-gold">✦</span>
      <h1 className="mt-4 font-serif text-6xl font-extrabold text-brand-text md:text-7xl">
        404
      </h1>
      <p className="mt-4 font-sans text-lg font-semibold text-brand-text-muted">
        The page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="mt-8 rounded-xl bg-brand-gold px-6 py-3 font-sans text-sm font-bold text-brand-brown hover:bg-brand-gold-hover shadow-lg hover:shadow-brand-gold/15 transition-all duration-200"
      >
        Go back to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
