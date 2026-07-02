import React, { useState } from 'react';
import { AlertTriangle, Eye, EyeOff } from 'lucide-react';

interface ConfirmPasswordModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
  title?: string;
  description?: string;
}

export default function ConfirmPasswordModal({
  open, onClose, onConfirm,
  title = 'Apply Changes?',
  description = 'Please re-enter your password to apply changes.'
}: ConfirmPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async () => {
    if (!password) { setError('Please enter your password.'); return; }
    setLoading(true); setError('');
    try {
      await onConfirm(password);
      setPassword('');
      onClose();
    } catch (e: any) {
      setError(e.message || 'Incorrect password.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => { setPassword(''); setError(''); setShowPw(false); onClose(); };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8">
        {/* Warning Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full border-2 border-amber-400 flex items-center justify-center">
            <AlertTriangle size={28} className="text-amber-500" />
          </div>
        </div>
        {/* Title */}
        <h2 className="text-xl font-heading font-bold text-gray-900 text-center mb-2">{title}</h2>
        {/* Description */}
        <p className="text-sm font-inter text-gray-600 mb-4">{description}</p>
        {/* Password input */}
        <div className="relative mb-2">
          <input
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="Password"
            className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl text-sm font-inter focus:outline-none focus:ring-2 focus:ring-[#1B75BC]/30 focus:border-[#1B75BC] bg-white"
          />
          <button
            type="button"
            onClick={() => setShowPw(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {error && <p className="text-xs text-[#C62828] mb-3 font-inter">{error}</p>}
        {/* Footer */}
        <div className="border-t border-gray-100 mt-4 pt-4 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-heading font-semibold text-sm rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-3 bg-[#050A30] hover:bg-[#0a1545] disabled:opacity-60 text-white font-heading font-semibold text-sm rounded-xl transition-colors"
          >
            {loading ? 'Verifying...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}
