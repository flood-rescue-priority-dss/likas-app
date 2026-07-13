import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { authService } from '../services';
import { useAuth } from '../contexts/AuthContext';

export default function ChangePasswordPage() {
  const { refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword]   = useState('');
  const [newPassword,     setNewPassword]        = useState('');
  const [confirmPassword, setConfirmPassword]    = useState('');
  const [showCurrent,     setShowCurrent]        = useState(false);
  const [showNew,         setShowNew]            = useState(false);
  const [showConfirm,     setShowConfirm]        = useState(false);
  const [error,           setError]              = useState('');
  const [saving,          setSaving]             = useState(false);
  const [done,            setDone]               = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      // Re-fetch the user so mustChangePassword becomes false in context
      await refreshUser();
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  const handleContinue = () => {
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F0F4F7] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header badge */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-2.5 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full">
            <Lock size={14} className="text-amber-600" />
            <span className="text-xs font-inter font-semibold text-amber-700 uppercase tracking-wide">
              Action Required
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {done ? (
            /* ── Success state ───────────────────────────────────────────── */
            <div className="p-10 flex flex-col items-center text-center">
              <CheckCircle2 size={48} className="text-emerald-500 mb-4" strokeWidth={1.5} />
              <h2 className="font-heading font-bold text-2xl text-gray-900 mb-2">
                Password Updated
              </h2>
              <p className="text-sm font-inter text-gray-500 mb-8 max-w-xs">
                Your password has been changed successfully. You can now continue to the dashboard.
              </p>
              <button
                onClick={handleContinue}
                className="w-full py-3.5 bg-[#050A30] hover:bg-[#0a1545] text-white font-heading font-bold text-sm rounded-xl transition-colors"
              >
                Continue to Dashboard
              </button>
            </div>
          ) : (
            /* ── Form state ──────────────────────────────────────────────── */
            <>
              <div className="px-8 pt-8 pb-6 border-b border-gray-50">
                <h2 className="font-heading font-bold text-xl text-gray-900">Set a New Password</h2>
                <p className="text-sm font-inter text-gray-500 mt-1">
                  Your account requires a password change before you can continue.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
                <PasswordField
                  label="Current Password"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  show={showCurrent}
                  onToggle={() => setShowCurrent(v => !v)}
                />
                <PasswordField
                  label="New Password"
                  value={newPassword}
                  onChange={setNewPassword}
                  show={showNew}
                  onToggle={() => setShowNew(v => !v)}
                  hint="Minimum 8 characters"
                />
                <PasswordField
                  label="Confirm Password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  show={showConfirm}
                  onToggle={() => setShowConfirm(v => !v)}
                />

                {error && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                    <p className="text-xs text-[#C62828] font-inter">{error}</p>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-3.5 bg-[#050A30] hover:bg-[#0a1545] disabled:opacity-60 text-white font-heading font-bold text-sm rounded-xl transition-colors"
                  >
                    {saving ? 'Saving…' : 'Change Password'}
                  </button>
                </div>
              </form>

              <div className="px-8 pb-6">
                <button
                  type="button"
                  onClick={() => { logout(); }}
                  className="w-full text-xs font-inter text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Sign out instead
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Reusable password field ───────────────────────────────────────────────────

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-inter font-medium text-gray-600 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm font-inter bg-[#F8F9FC] focus:outline-none focus:ring-2 focus:ring-[#1B75BC]/30 focus:border-[#1B75BC] focus:bg-white transition-all"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {hint && <p className="mt-1 text-xs font-inter text-gray-400">{hint}</p>}
    </div>
  );
}
