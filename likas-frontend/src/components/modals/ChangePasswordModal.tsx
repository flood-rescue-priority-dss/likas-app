import { useState } from 'react';
import { CheckCircle2, Eye, EyeOff, X } from 'lucide-react';
import ConfirmPasswordModal from './ConfirmPasswordModal';
import { authService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';

type Step = 'confirm' | 'form' | 'success';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const { logout } = useAuth();
  const [step, setStep] = useState<Step>('confirm');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showRetype, setShowRetype] = useState(false);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const resetAndClose = () => {
    setStep('confirm');
    setCurrentPassword('');
    setNewPassword('');
    setRetypePassword('');
    setFormError('');
    onClose();
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (newPassword.length < 8) {
      setFormError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== retypePassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setStep('success');
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ConfirmPasswordModal
        open={step === 'confirm'}
        onCancel={resetAndClose}
        onConfirm={async (password) => {
          // Throws on incorrect password — ConfirmPasswordModal surfaces the error
          await authService.verifyPassword(password);
          setCurrentPassword(password);
          setStep('form');
        }}
      />

      {step !== 'confirm' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animate-fadeIn">
          {step === 'form' && (
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-xl p-8 animate-slideUp">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-inter uppercase text-gray-400">Change Password</h3>
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

                {formError && (
                  <p className="text-xs text-[#C62828] font-inter">{formError}</p>
                )}

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
                    disabled={saving}
                    className="px-5 py-2.5 bg-[#050A30] hover:bg-[#0a1545] disabled:opacity-60 text-white font-heading font-semibold text-sm rounded-xl transition-colors"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 'success' && (
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-8 text-center animate-slideUp">
              <CheckCircle2 className="mx-auto mb-4 text-[#050A30]" size={40} strokeWidth={1.5} />
              <h3 className="font-heading font-bold text-xl text-gray-900 mb-2">Password Updated!</h3>
              <p className="text-sm font-inter text-gray-500 mb-6">
                Your password has been changed successfully. Please log in again with your new password.
              </p>
              <button
                onClick={() => { resetAndClose(); logout(); }}
                className="px-6 py-2.5 bg-[#050A30] hover:bg-[#0a1545] text-white font-heading font-semibold text-sm rounded-xl transition-colors"
              >
                Log In Again
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
    <div className="grid grid-cols-5 items-center gap-10">
      <label className="col-span-2 text-sm font-inter font-medium text-gray-600">{label}</label>
      <div className="col-span-3 relative">
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
