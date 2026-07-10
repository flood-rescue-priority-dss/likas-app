import { useState } from 'react';
import { AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { floodService, authService } from '../../services';

interface DeleteIncidentModalProps {
  open: boolean;
  onCancel: () => void;
  incidentId: string | null;
  onDeleted: (deletedId: string) => void;
}

export default function DeleteIncidentModal({ open, onCancel, incidentId, onDeleted }: DeleteIncidentModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open || !incidentId) return null;

  const handleCancel = () => {
    setPassword('');
    setError('');
    setShowPassword(false);
    onCancel();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // First verify the password
      await authService.verifyPassword(password);
      // Then delete the incident
      await floodService.deleteFloodIncident(incidentId);
      onDeleted(incidentId);
      setPassword('');
      setShowPassword(false);
      onCancel();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete incident.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-8 text-center animate-slideUp">
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full border-2 border-red-400 flex items-center justify-center">
            <AlertTriangle size={28} className="text-red-500" />
          </div>
        </div>
        <h3 className="font-heading font-bold text-xl text-gray-900 mb-2">Delete Incident?</h3>
        <p className="text-sm font-inter text-gray-500 mb-5">
          Please re-enter your password to apply changes.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
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
          {error && <p className="text-xs text-[#C62828] text-left font-inter">{error}</p>}
          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-heading font-semibold text-sm rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#C62828] hover:bg-red-800 disabled:opacity-60 text-white font-heading font-semibold text-sm rounded-xl transition-colors"
            >
              {loading ? 'Deleting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
