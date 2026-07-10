import { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';
import Modal from '../ui/Modal';
import DropdownSelect from '../ui/DropdownSelect';
import InfoTooltip from '../ui/InfoTooltip';
import { floodService } from '../../services';
import type { FloodIncident, FloodCause, Priority } from '../../types';

const STREETS = ['Padre Faura Taft South Bound', 'NBI Taft', 'Quirino Ave.', 'Taft Avenue', 'Pedro Gil', 'United Nations Avenue'];
const CAUSES: FloodCause[] = ['Heavy Rainfall', 'Tropical Cyclone'];

const calcPriority = (depth: number): Priority => {
  if (depth < 10) return 'Low';
  if (depth < 20) return 'Medium';
  return 'High';
};

interface LogIncidentModalProps {
  open: boolean;
  onClose: () => void;
  barangayId: string;
  onSaved: (incident: FloodIncident) => void;
}

export default function LogIncidentModal({ open, onClose, barangayId, onSaved }: LogIncidentModalProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [street, setStreet] = useState('');
  const [depth, setDepth] = useState(0);
  const [cause, setCause] = useState<FloodCause | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [priority, setPriority] = useState<Priority>('Low');
  const [showOverridePrompt, setShowOverridePrompt] = useState(false);
  const [step, setStep] = useState<'form' | 'overview'>('form');

  const handleProceedToOverview = () => {
    if (!date || !time || !street || depth <= 0 || !cause) {
      setError('Please fill in all required fields (depth must be greater than 0).');
      return;
    }
    setError('');
    setStep('overview');
  };

  const handleSave = async (forceOverride = false) => {
    if (!date || !time || !street || depth <= 0 || !cause) {
      setError('Please fill in all required fields (depth must be greater than 0).');
      return;
    }
    setLoading(true); setError('');
    try {
      const incident = await floodService.createFloodIncident({
        barangayId,
        date,
        time,
        street,
        depthInches: depth,
        status: 'PATV',
        cause: cause as FloodCause,
        priority,
      }, forceOverride);
      onSaved(incident);
      resetForm();
      onClose();
    } catch (e: any) {
      if (e.message === 'DuplicateRecord') {
        setShowOverridePrompt(true);
      } else {
        setError(e.message || 'Failed to save incident.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDate(''); setTime(''); setStreet(''); setDepth(0); setCause('');
    setError(''); setPriority('Low'); setShowOverridePrompt(false); setStep('form');
  };

  const handleClose = () => { resetForm(); onClose(); };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Incident Log"
      size="md"
      headerRight={<InfoTooltip />}
    >
      <div className="space-y-4">
        {step === 'form' ? (
          <>
            {/* Date */}
            <div>
              <label className="block text-xs font-inter font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Date <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-4 py-3 pr-4 border border-gray-200 rounded-xl text-sm font-inter bg-white focus:outline-none focus:ring-2 focus:ring-[#1B75BC]/30 focus:border-[#1B75BC]"
                />
              </div>
            </div>

            {/* Time */}
            <div>
              <label className="block text-xs font-inter font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Time <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="time"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="w-full px-4 py-3 pr-4 border border-gray-200 rounded-xl text-sm font-inter bg-white focus:outline-none focus:ring-2 focus:ring-[#1B75BC]/30 focus:border-[#1B75BC]"
                />
              </div>
            </div>

            {/* Street */}
            <div>
              <label className="block text-xs font-inter font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Street <span className="text-red-500">*</span></label>
              <DropdownSelect
                options={STREETS.map(s => ({ value: s, label: s }))}
                value={street}
                onChange={setStreet}
                placeholder="Type or select a street"
              />
            </div>

            {/* Flood Depth */}
            <div>
              <label className="block text-xs font-inter font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Flood Depth <span className="text-red-500">*</span></label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={depth}
                  onChange={e => setDepth(Number(e.target.value))}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-inter bg-white focus:outline-none focus:ring-2 focus:ring-[#1B75BC]/30 focus:border-[#1B75BC]"
                />
                <span className="px-4 py-3 bg-[#F0F4F7] border border-gray-200 rounded-xl text-sm font-inter text-gray-600 font-medium">in</span>
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
              <label className="block text-xs font-inter font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Cause <span className="text-red-500">*</span></label>
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
                onClick={handleProceedToOverview}
                className="flex-1 py-3 bg-[#050A30] hover:bg-[#0a1545] text-white font-heading font-semibold text-sm rounded-xl transition-colors"
              >
                Review Details
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4 mb-8 mt-2">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date & Time</p>
                <p className="font-medium text-gray-900">{date} at {time}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Street</p>
                <p className="font-medium text-gray-900">{street}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Flood Depth</p>
                <p className="font-medium text-gray-900">{depth} inches</p>
                <p className="text-xs font-inter mt-1 text-gray-400">
                  Estimated priority: <span className={`font-semibold ${
                    calcPriority(depth) === 'Low' ? 'text-emerald-600' :
                    calcPriority(depth) === 'Medium' ? 'text-amber-600' :
                    'text-red-600'
                  }`}>{calcPriority(depth)}</span>
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Cause</p>
                <p className="font-medium text-gray-900">{cause}</p>
              </div>
            </div>

            {error && !showOverridePrompt && (
              <p className="text-xs text-[#C62828] font-inter">{error}</p>
            )}

            {/* Footer */}
            {showOverridePrompt ? (
              <div className="border-t border-gray-100 pt-4 mt-2">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 flex items-start gap-2">
                  <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs font-inter text-amber-800 font-medium">Do you wish to still add? There is existing data.</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowOverridePrompt(false)}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-heading font-semibold text-sm rounded-xl transition-colors"
                  >
                    No, cancel
                  </button>
                  <button
                    onClick={() => handleSave(true)}
                    disabled={loading}
                    className="flex-1 py-3 bg-[#050A30] hover:bg-[#0a1545] disabled:opacity-60 text-white font-heading font-semibold text-sm rounded-xl transition-colors"
                  >
                    {loading ? 'Saving...' : 'Yes, add anyway'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-100 pt-4 flex gap-3 mt-2">
                <button
                  onClick={() => { setStep('form'); setError(''); }}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-heading font-semibold text-sm rounded-xl transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => handleSave(false)}
                  disabled={loading}
                  className="flex-1 py-3 bg-[#050A30] hover:bg-[#0a1545] disabled:opacity-60 text-white font-heading font-semibold text-sm rounded-xl transition-colors"
                >
                  {loading ? 'Saving...' : 'Confirm'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
