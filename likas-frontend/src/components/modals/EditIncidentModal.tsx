import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import DropdownSelect from '../ui/DropdownSelect';
import { floodService } from '../../services';
import type { FloodIncident, FloodCause, Priority } from '../../types';

const STREETS = ['Padre Faura Taft South Bound', 'NBI Taft', 'Quirino Ave.', 'Taft Avenue', 'Pedro Gil', 'United Nations Avenue'];
const CAUSES: FloodCause[] = ['Heavy Rainfall', 'Tropical Cyclone'];

const calcPriority = (depth: number): Priority => {
  if (depth < 10) return 'Low';
  if (depth < 20) return 'Medium';
  return 'High';
};

interface EditIncidentModalProps {
  open: boolean;
  onClose: () => void;
  incident: FloodIncident | null;
  onSaved: (updatedIncident: FloodIncident) => void;
}

export default function EditIncidentModal({ open, onClose, incident, onSaved }: EditIncidentModalProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [street, setStreet] = useState('');
  const [depth, setDepth] = useState(0);
  const [cause, setCause] = useState<FloodCause | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (incident && open) {
      setDate(incident.date);
      setTime(incident.time);
      setStreet(incident.street);
      setDepth(incident.depthInches);
      setCause(incident.cause as FloodCause);
      setError('');
    }
  }, [incident, open]);

  const handleSave = async () => {
    if (!incident) return;
    if (!date || !time || !street || depth <= 0 || !cause) {
      setError('Please fill in all required fields (depth must be greater than 0).');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const updated = await floodService.updateFloodIncident(incident.id, {
        date,
        time,
        street,
        depthInches: depth,
        cause: cause as FloodCause,
      });
      onSaved(updated);
      resetForm();
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to update incident.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDate('');
    setTime('');
    setStreet('');
    setDepth(0);
    setCause('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!incident) return null;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Update Incident Details"
      size="md"
    >
      <div className="space-y-4">
        {/* Date */}
        <div>
          <label className="block text-xs font-inter font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-inter bg-white focus:outline-none focus:ring-2 focus:ring-[#1B75BC]/30 focus:border-[#1B75BC]"
          />
        </div>

        {/* Time */}
        <div>
          <label className="block text-xs font-inter font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
            Time <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-inter bg-white focus:outline-none focus:ring-2 focus:ring-[#1B75BC]/30 focus:border-[#1B75BC]"
          />
        </div>

        {/* Street */}
        <div>
          <label className="block text-xs font-inter font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
            Location <span className="text-red-500">*</span>
          </label>
          <DropdownSelect
            options={STREETS.map(s => ({ value: s, label: s }))}
            value={street}
            onChange={setStreet}
            placeholder="Type or select a street"
          />
        </div>

        {/* Flood Depth */}
        <div>
          <label className="block text-xs font-inter font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
            Flood Depth <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={depth}
              onChange={e => setDepth(Number(e.target.value))}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-inter bg-white focus:outline-none focus:ring-2 focus:ring-[#1B75BC]/30 focus:border-[#1B75BC]"
            />
            <span className="px-4 py-3 bg-[#F0F4F7] border border-gray-200 rounded-xl text-sm font-inter text-gray-600 font-medium">
              in
            </span>
          </div>
          {depth > 0 && (
            <p className="text-xs font-inter mt-1 text-gray-400">
              Estimated priority: <span className={`font-semibold ${
                calcPriority(depth) === 'Low' ? 'text-emerald-600' :
                calcPriority(depth) === 'Medium' ? 'text-amber-600' :
                'text-red-600'
              }`}>{calcPriority(depth)}</span>
            </p>
          )}
        </div>

        {/* Cause */}
        <div>
          <label className="block text-xs font-inter font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
            Cause <span className="text-red-500">*</span>
          </label>
          <DropdownSelect
            options={CAUSES.map(c => ({ value: c, label: c }))}
            value={cause}
            onChange={v => setCause(v as FloodCause)}
            placeholder="Type or select a cause"
          />
        </div>

        {error && (
          <p className="text-xs text-[#C62828] font-inter">{error}</p>
        )}

        <div className="border-t border-gray-100 pt-4 flex gap-3 mt-2">
          <button
            onClick={handleClose}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-heading font-semibold text-sm rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-3 bg-[#050A30] hover:bg-[#0a1545] disabled:opacity-60 text-white font-heading font-semibold text-sm rounded-xl transition-colors"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
