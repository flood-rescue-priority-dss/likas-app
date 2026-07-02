import { useState, useRef, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import Modal from '../ui/Modal';
import DropdownSelect from '../ui/DropdownSelect';
import InfoTooltip from '../ui/InfoTooltip';
import { floodService } from '../../services';
import type { FloodIncident, FloodCause, Priority } from '../../types';

const STREETS = ['Padre Faura Taft South Bound', 'NBI Taft', 'Quirino Ave.', 'Taft Avenue', 'Pedro Gil', 'United Nations Avenue'];
const CAUSES: FloodCause[] = ['Heavy Rainfall', 'Tropical Cyclone', 'High Tide', 'Infrastructure Failure'];

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

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState<'AM' | 'PM'>('PM');

  const timeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (timeRef.current && !timeRef.current.contains(e.target as Node)) {
        setShowTimePicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleTimeSelect = (h: number, m: number, p: 'AM' | 'PM') => {
    setHour(h); setMinute(m); setPeriod(p);
    const h24 = p === 'PM' && h !== 12 ? h + 12 : p === 'AM' && h === 12 ? 0 : h;
    setTime(`${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  };

  const displayTime = time
    ? `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`
    : '';

  const handleSave = async () => {
    if (!date || !time || !street || !cause) {
      setError('Please fill in all required fields.');
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
      });
      onSaved(incident);
      resetForm();
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to save incident.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDate(''); setTime(''); setStreet(''); setDepth(0); setCause('');
    setError(''); setHour(12); setMinute(0); setPeriod('PM'); setPriority('Low');
  };

  const handleClose = () => { resetForm(); onClose(); };

  const hours = [8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7];
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Incident Log"
      size="md"
      headerRight={<InfoTooltip />}
    >
      <div className="space-y-4">
        {/* Date */}
        <div>
          <label className="block text-xs font-inter font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Date</label>
          <div className="relative">
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl text-sm font-inter bg-white focus:outline-none focus:ring-2 focus:ring-[#1B75BC]/30 focus:border-[#1B75BC]"
            />
            <Calendar size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Time */}
        <div>
          <label className="block text-xs font-inter font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Time</label>
          <div className="relative" ref={timeRef}>
            <button
              type="button"
              onClick={() => setShowTimePicker(v => !v)}
              className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl text-sm font-inter bg-white transition-all ${
                showTimePicker ? 'border-[#1B75BC] ring-2 ring-[#1B75BC]/20' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className={displayTime ? 'text-gray-800' : 'text-gray-400'}>
                {displayTime || 'hh:mm --'}
              </span>
              <Clock size={15} className="text-gray-400" />
            </button>

            {showTimePicker && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
                <div className="flex divide-x divide-gray-100">
                  {/* Hours */}
                  <div className="flex-1 max-h-48 overflow-y-auto">
                    <p className="text-xs font-inter text-gray-400 px-3 py-2 uppercase tracking-wide sticky top-0 bg-white">Hour</p>
                    {hours.map(h => (
                      <button
                        key={h}
                        onClick={() => handleTimeSelect(h, minute, period)}
                        className={`w-full text-center py-2 text-sm font-inter hover:bg-[#F0F4F7] ${h === hour ? 'bg-[#F0F4F7] font-semibold text-[#050A30]' : 'text-gray-700'}`}
                      >
                        {String(h).padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                  {/* Minutes */}
                  <div className="flex-1 max-h-48 overflow-y-auto">
                    <p className="text-xs font-inter text-gray-400 px-3 py-2 uppercase tracking-wide sticky top-0 bg-white">Min</p>
                    {minutes.map(m => (
                      <button
                        key={m}
                        onClick={() => handleTimeSelect(hour, m, period)}
                        className={`w-full text-center py-2 text-sm font-inter hover:bg-[#F0F4F7] ${m === minute ? 'bg-[#F0F4F7] font-semibold text-[#050A30]' : 'text-gray-700'}`}
                      >
                        {String(m).padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                  {/* AM/PM */}
                  <div className="w-20">
                    <p className="text-xs font-inter text-gray-400 px-3 py-2 uppercase tracking-wide">Period</p>
                    {(['AM', 'PM'] as const).map(p => (
                      <button
                        key={p}
                        onClick={() => handleTimeSelect(hour, minute, p)}
                        className={`w-full text-center py-3 text-sm font-inter hover:bg-[#F0F4F7] ${p === period ? 'bg-[#F0F4F7] font-semibold text-[#050A30]' : 'text-gray-700'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Street */}
        <div>
          <label className="block text-xs font-inter font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Street</label>
          <DropdownSelect
            options={STREETS.map(s => ({ value: s, label: s }))}
            value={street}
            onChange={setStreet}
            placeholder="Type or select a street"
          />
        </div>

        {/* Flood Depth */}
        <div>
          <label className="block text-xs font-inter font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Flood Depth</label>
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
          <label className="block text-xs font-inter font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Cause</label>
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

        {/* Footer */}
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
            {loading ? 'Saving...' : 'Save Incident'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
