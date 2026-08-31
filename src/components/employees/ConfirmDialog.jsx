import React, { useEffect, useRef } from 'react';
import { IoWarningOutline } from 'react-icons/io5';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText, isDestructive, isProcessing }) => {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isProcessing) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isProcessing]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#12141C]/40 backdrop-blur-sm p-4">
      <div 
        ref={overlayRef}
        className="absolute inset-0"
        onClick={() => !isProcessing && onClose()}
      ></div>
      
      <div className="relative bg-[#FFFFFF] rounded-2xl shadow-xl w-full max-w-md overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className={`shrink-0 p-3 rounded-full ${isDestructive ? 'bg-[#C1443A]/10 text-[#C1443A]' : 'bg-[#C9A227]/10 text-[#C9A227]'}`}>
              <IoWarningOutline size={24} />
            </div>
            <div>
              <h3 className="font-serif text-xl font-semibold text-[#1C1F2A] mb-2">{title}</h3>
              <p className="text-[#6B7280] text-sm leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-[#F4F5F8] border-t border-[#E7E8EE] flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-5 py-2 text-sm font-semibold text-[#1C1F2A] bg-white border border-[#E7E8EE] rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className={`px-5 py-2 text-sm font-semibold text-white rounded-lg transition-colors flex items-center justify-center gap-2 min-w-[100px] ${
              isDestructive 
                ? 'bg-[#C1443A] hover:bg-[#A93830]' 
                : 'bg-[#C9A227] hover:bg-[#B49122]'
            } disabled:opacity-70`}
          >
            {isProcessing && (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
