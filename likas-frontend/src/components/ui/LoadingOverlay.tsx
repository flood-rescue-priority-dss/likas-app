import React from 'react';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export default function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  if (!visible) return null;
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-tl-3xl"
      style={{ backgroundColor: 'rgba(240, 244, 247, 0.85)', backdropFilter: 'blur(2px)' }}>
      <div className="spinner-dark" />
      {message && (
        <p className="mt-4 text-sm font-inter text-gray-600 font-medium">{message}</p>
      )}
    </div>
  );
}
