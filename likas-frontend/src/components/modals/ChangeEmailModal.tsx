import { useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import ConfirmPasswordModal from './ConfirmPasswordModal';
import { authService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';

type Step = 'confirmPassword' | 'form' | 'verify' | 'success';

interface ChangeEmailModalProps {
  open: boolean;
  onClose: () => void;
  currentEmail: string;
}

export default function ChangeEmailModal({ open, onClose, currentEmail }: ChangeEmailModalProps) {
  const { logout } = useAuth();
  const [step, setStep] = useState<Step>('confirmPassword');
  const [newEmail, setNewEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const resetAndClose = () => {
    setStep('confirmPassword');
    setNewEmail('');
    setVerificationCode('');
    setFormError('');
    onClose();
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newEmail) { setFormError('Please enter a new email address.'); return; }
    if (newEmail === currentEmail) { setFormError('New email must be different from your current email.'); return; }

    setLoading(true);
    try {
      await authService.requestEmailChange(newEmail);
      setStep('verify');
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!verificationCode) { setFormError('Please enter the verification code.'); return; }

    setLoading(true);
    try {
      await authService.confirmEmailChange(verificationCode);
      setStep('success');
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ConfirmPasswordModal
        open={step === 'confirmPassword'}
        onCancel={resetAndClose}
        onConfirm={async (password) => {
          // Throws on incorrect password — ConfirmPasswordModal surfaces the error
          await authService.verifyPassword(password);
          setStep('form');
        }}
      />

      {step !== 'confirmPassword' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          {step === 'form' && (
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-inter uppercase text-gray-400">Change Email</h3>
                <button onClick={resetAndClose} className="text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleVerifyEmail} className="space-y-4">
                <div className="grid grid-cols-5 items-center gap-4">
                  <label className="col-span-2 text-sm font-inter font-medium text-gray-600">
                    Current Email
                  </label>
                  <input
                    value={currentEmail}
                    readOnly
                    className="col-span-3 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-inter bg-gray-50 text-gray-400 cursor-default"
                  />
                </div>
                <div className="grid grid-cols-5 items-center gap-4">
                  <label className="col-span-2 text-sm font-inter font-medium text-gray-600">
                    New Email
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder="new@email.gov.ph"
                    className="col-span-3 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-inter bg-[#F8F9FC] focus:outline-none focus:ring-2 focus:ring-[#1B75BC]/30 focus:border-[#1B75BC] focus:bg-white transition-all"
                  />
                </div>

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
                    disabled={loading}
                    className="px-5 py-2.5 bg-[#050A30] hover:bg-[#0a1545] disabled:opacity-60 text-white font-heading font-semibold text-sm rounded-xl transition-colors"
                  >
                    {loading ? 'Sending...' : 'Verify Email'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 'verify' && (
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-inter text-gray-400 uppercase">Change Email</h3>
                <button onClick={resetAndClose} className="text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitCode} className="space-y-4">
                <div className="text-sm flex flex-col items-center text-center font-inter font-regular text-gray-600">
                  <p className="max-w-sm">
                    A 6-digit verification code was sent to{' '}
                    <span className="font-medium text-gray-800">{newEmail}</span>.
                    Enter it below to confirm the change.
                  </p>
                </div>
                <div className="grid grid-cols-5 items-center gap-8">
                  <label className="col-span-2 text-sm font-inter font-medium text-gray-600">
                    Verification Code
                  </label>
                  <input
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value)}
                    placeholder="XXXXXX"
                    maxLength={6}
                    className="col-span-3 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-inter bg-[#F8F9FC] focus:outline-none focus:ring-2 focus:ring-[#1B75BC]/30 focus:border-[#1B75BC] focus:bg-white transition-all"
                  />
                </div>

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
                    disabled={loading}
                    className="px-5 py-2.5 bg-[#050A30] hover:bg-[#0a1545] disabled:opacity-60 text-white font-heading font-semibold text-sm rounded-xl transition-colors"
                  >
                    {loading ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 'success' && (
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-8 text-center">
              <CheckCircle2 className="mx-auto mb-4 text-[#050A30]" size={40} strokeWidth={1.5} />
              <h3 className="font-heading font-bold text-xl text-gray-900 mb-2">Email Updated!</h3>
              <p className="text-sm font-inter text-gray-500 mb-6">
                Your email has been changed successfully. Please log in again with your new email.
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
