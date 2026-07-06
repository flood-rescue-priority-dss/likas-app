import React, { useState } from 'react';
import { AlertTriangle, Eye, EyeOff } from 'lucide-react';

interface ConfirmPasswordModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (password: string) => void;
}

export default function ConfirmPasswordModal({ open, onCancel, onConfirm }: ConfirmPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(password);
    setPassword('');
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-8 text-center">
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full border-2 border-amber-400 flex items-center justify-center">
            <AlertTriangle size={28} className="text-amber-500" />
          </div>
        </div>
        <h3 className="font-heading font-bold text-xl text-gray-900 mb-2">Password Confirmation Required</h3>
        <p className="text-sm font-inter text-gray-500 mb-5">
          For your security, please re-enter your password to continue.
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative text-left">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm font-inter bg-[#F8F9FC] focus:outline-none focus:ring-2 focus:ring-[#1B75BC]/30 focus:border-[#1B75BC] focus:bg-white transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-heading font-semibold text-sm rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#050A30] hover:bg-[#0a1545] text-white font-heading font-semibold text-sm rounded-xl transition-colors"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}