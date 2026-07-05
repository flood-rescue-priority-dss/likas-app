import React, { useState } from 'react';
import { CheckCircle2, Eye, EyeOff, X } from 'lucide-react';
import ConfirmPasswordModal from './ConfirmPasswordModal';

type Step = 'confirm' | 'form' | 'success';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const [step, setStep] = useState<Step>('confirm');
  const [newPassword, setNewPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showRetype, setShowRetype] = useState(false);

  if (!open) return null;

  const resetAndClose = () => {
    setStep('confirm');
    setNewPassword('');
    setRetypePassword('');
    onClose();
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: validate newPassword === retypePassword, strength, etc.
    setStep('success');
  };

  return (
    <>
      <ConfirmPasswordModal
        open={step === 'confirm'}
        onCancel={resetAndClose}
        onConfirm={(password) => {
          // TODO: verify old/current password against backend
          console.log('Verifying password:', password);
          setStep('form');
        }}
      />

      {step !== 'confirm' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          {step === 'form' && (
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-inter text-gray-400 uppercase tracking-widest">Change Password</h3>
                <button onClick={resetAndClose} className="text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveChanges} className="space-y-4">
                <Field
                  label="New Password"
                  value={newPassword}
                  onChange={setNewPassword}
                  type={showNew ? 'text' : 'password'}
                  toggle={() => setShowNew(v => !v)}
                  showToggle={showNew}
                />
                <Field
                  label="Retype Password"
                  value={retypePassword}
                  onChange={setRetypePassword}
                  type={showRetype ? 'text' : 'password'}
                  toggle={() => setShowRetype(v => !v)}
                  showToggle={showRetype}
                />

                <div className="border-t border-gray-100 pt-5 flex justify-between">
                  <button
                    type="button"
                    onClick={resetAndClose}
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-heading font-semibold text-sm rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#050A30] hover:bg-[#0a1545] text-white font-heading font-semibold text-sm rounded-xl transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 'success' && (
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-8 text-center">
              <CheckCircle2 className="mx-auto mb-4 text-[#050A30]" size={40} strokeWidth={1.5} />
              <h3 className="font-heading font-bold text-xl text-gray-900 mb-2">Password Updated!</h3>
              <p className="text-sm font-inter text-gray-500 mb-6">
                Your password has been changed successfully. Please log in again with your new password.
              </p>
              <button
                onClick={resetAndClose}
                className="px-6 py-2.5 bg-[#050A30] hover:bg-[#0a1545] text-white font-heading font-semibold text-sm rounded-xl transition-colors"
              >
                Submit
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  toggle,
  showToggle,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  toggle?: () => void;
  showToggle?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-inter font-medium text-gray-600 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm font-inter bg-[#F8F9FC] focus:outline-none focus:ring-2 focus:ring-[#1B75BC]/30 focus:border-[#1B75BC] focus:bg-white transition-all"
        />
        {toggle && (
          <button
            type="button"
            onClick={toggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showToggle ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}
