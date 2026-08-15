import React, { useEffect } from 'react';
import { IoCloseOutline } from 'react-icons/io5';

const Modal = ({ isOpen, onClose, title, size = 'max-w-lg', children }) => {
  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-brand-brown/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className={`relative w-full ${size} transform rounded-2xl border border-brand-border bg-white p-6 shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95 slide-in-from-bottom-8`}>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-border pb-4">
          <h3 className="text-xl font-serif font-bold text-brand-text">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-brand-text-muted hover:bg-brand-cream-dark hover:text-brand-text transition-colors"
          >
            <IoCloseOutline className="h-6 w-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-4 max-h-[75vh] overflow-y-auto pr-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
