import React, { useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import ConfirmPasswordModal from './ConfirmPasswordModal';

type Step = 'confirmPassword' | 'form' | 'verify' | 'success';

interface ChangeEmailModalProps {
  open: boolean;
  onClose: () => void;
  currentEmail: string;
}

export default function ChangeEmailModal({ open, onClose, currentEmail }: ChangeEmailModalProps) {
  const [step, setStep] = useState<Step>('confirmPassword');
  const [currentEmailInput, setCurrentEmailInput] = useState(currentEmail);
  const [newEmail, setNewEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  if (!open) return null;

  const resetAndClose = () => {
    setStep('confirmPassword');
    setCurrentEmailInput(currentEmail);
    setNewEmail('');
    setVerificationCode('');
    onClose();
  };

  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: trigger backend to send verification code to newEmail
    setStep('verify');
  };

  const handleSubmitCode = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: verify code against backend
    setStep('success');
  };

  return (
    <>
      <ConfirmPasswordModal
        open={step === 'confirmPassword'}
        onCancel={resetAndClose}
        onConfirm={(password) => {
          // TODO: verify password against backend
          console.log('Verifying password:', password);
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
                    value={currentEmailInput}
                    onChange={e => setCurrentEmailInput(e.target.value)}
                    className="col-span-3 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-inter bg-[#F8F9FC] focus:outline-none focus:ring-2 focus:ring-[#1B75BC]/30 focus:border-[#1B75BC] focus:bg-white transition-all"
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
                    Verify Email
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

                <div className="text-sm flex flex-col items-center text-center font-inter font-regular text-gray-600 ">
                  <p className="max-w-sm">
                    A 6-digit verification code was sent to [new email]. Enter it below to confirm the change.
                  </p>
                </div>
                <div className=" pt-0 grid grid-cols-5 items-center gap-8">
                  <label className="col-span-2 text-sm font-inter font-medium text-gray-600">
                    Verification Code
                  </label>
                  <input
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value)}
                    placeholder="XXXXXX"
                    className="col-span-3 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-inter bg-[#F8F9FC] focus:outline-none focus:ring-2 focus:ring-[#1B75BC]/30 focus:border-[#1B75BC] focus:bg-white transition-all"
                  />
                </div>

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
                    Submit
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
