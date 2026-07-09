import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  hideHeader?: boolean;
}

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-3xl',
};

export default function Modal({ open, onClose, title, size = 'md', children, headerRight, hideHeader }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`relative w-full ${SIZES[size]} bg-[#F8F9FC] shadow-2xl overflow-hidden
          rounded-t-3xl sm:rounded-3xl
          max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {!hideHeader && (
          <div className="flex items-center justify-between px-6 sm:px-8 pt-6 sm:pt-7 pb-2">
            <p className="text-xs font-inter text-gray-400 uppercase tracking-widest">{title}</p>
            <div className="flex items-center gap-2">
              {headerRight}
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}
        <div className="px-6 sm:px-8 pb-8 pt-4">{children}</div>
      </div>
    </div>
  );
}
