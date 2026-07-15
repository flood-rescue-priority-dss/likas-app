import { useState, useEffect, useRef } from 'react';
import { Paperclip, X, FileImage } from 'lucide-react';
import Modal from '../ui/Modal';
import DropdownSelect from '../ui/DropdownSelect';
import { floodService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import type { FloodIncident, FloodCause, Priority } from '../../types';

const STREETS = ['Padre Faura Taft South Bound', 'NBI Taft', 'Quirino Ave.', 'Taft Avenue', 'Pedro Gil', 'United Nations Avenue'];
const CAUSES: FloodCause[] = ['Heavy Rainfall', 'Tropical Cyclone'];

const calcPriority = (depth: number): Priority => {
  if (depth < 10) return 'Low';
  if (depth < 20) return 'Medium';
  return 'High';
};

/** Extract just the filename from a server path like /uploads/flood-attachments/xyz-photo.jpg */
const basename = (p: string) => p.split('/').pop() ?? p;

interface EditIncidentModalProps {
  open: boolean;
  onClose: () => void;
  incident: FloodIncident | null;
  onSaved: (updatedIncident: FloodIncident) => void;
}

export default function EditIncidentModal({ open, onClose, incident, onSaved }: EditIncidentModalProps) {
  const { user } = useAuth();
  const isBarangay = user?.role === 'barangay';

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [street, setStreet] = useState('');
  const [depth, setDepth] = useState(0);
  const [cause, setCause] = useState<FloodCause | ''>('');
  const [newFile, setNewFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (incident && open) {
      setDate(incident.date);
      setTime(incident.time);
      setStreet(incident.street);
      setDepth(incident.depthInches);
      setCause(incident.cause as FloodCause);
      setNewFile(null);
      setError('');
    }
  }, [incident, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setNewFile(file);
  };

  const clearNewFile = () => {
    setNewFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (!incident) return;
    if (!date || !time || !street || depth <= 0 || !cause) {
      setError('Please fill in all required fields (depth must be greater than 0).');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const updated = await floodService.updateFloodIncident(
        incident.id,
        { date, time, street, depthInches: depth, cause: cause as FloodCause },
        newFile ?? undefined,
      );
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
    setDate(''); setTime(''); setStreet(''); setDepth(0); setCause('');
    setNewFile(null); setError('');
  };

  const handleClose = () => { resetForm(); onClose(); };

  if (!incident) return null;

  const currentAttachment = incident.remarksAttachment;
  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  return (
    <Modal open={open} onClose={handleClose} title="Update Incident Details" size="md">
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
              Estimated priority:{' '}
              <span className={`font-semibold ${
                calcPriority(depth) === 'Low' ? 'text-emerald-600' :
                calcPriority(depth) === 'Medium' ? 'text-amber-600' : 'text-red-600'
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

        {/* ── Attachment — barangay users only ─────────────────────────── */}
        {isBarangay && (
          <div>
            <label className="block text-xs font-inter font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
              Attachment
            </label>

            {/* Current attachment preview */}
            {currentAttachment && !newFile && (
              <div className="mb-2 rounded-xl overflow-hidden border border-blue-100 bg-blue-50">
                <img
                  src={`${API_BASE}${currentAttachment}`}
                  alt="Current attachment"
                  className="w-full max-h-48 object-contain"
                />
                <div className="flex items-center gap-2 px-3 py-2 border-t border-blue-100">
                  <FileImage size={14} className="text-blue-500 flex-shrink-0" />
                  <a
                    href={`${API_BASE}${currentAttachment}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-xs font-inter text-blue-600 hover:underline truncate"
                    title={basename(currentAttachment)}
                  >
                    {basename(currentAttachment)}
                  </a>
                  <span className="text-xs font-inter text-gray-400 flex-shrink-0">current</span>
                </div>
              </div>
            )}

            {/* New file selected preview */}
            {newFile && (
              <div className="mb-2 rounded-xl overflow-hidden border border-emerald-200 bg-emerald-50">
                <img
                  src={URL.createObjectURL(newFile)}
                  alt="New attachment preview"
                  className="w-full max-h-48 object-contain"
                />
                <div className="flex items-center gap-2 px-3 py-2 border-t border-emerald-200">
                  <FileImage size={14} className="text-emerald-500 flex-shrink-0" />
                  <span className="flex-1 text-xs font-inter text-emerald-700 truncate">{newFile.name}</span>
                  <button
                    type="button"
                    onClick={clearNewFile}
                    className="text-gray-400 hover:text-gray-600 flex-shrink-0 transition-colors"
                    title="Remove selected file"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* File picker */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 w-full border border-dashed border-gray-300 hover:border-[#1B75BC] hover:bg-blue-50/40 rounded-xl text-sm font-inter text-gray-500 hover:text-[#1B75BC] transition-colors"
            >
              <Paperclip size={14} />
              {currentAttachment ? 'Replace attachment…' : 'Upload attachment…'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-xs font-inter text-gray-400 mt-1">
              {newFile
                ? 'New file will replace the existing attachment when saved.'
                : currentAttachment
                  ? 'Leave unchanged to keep the current attachment.'
                  : 'Accepted: JPG, JPEG, PNG · Max 15 MB'}
            </p>
          </div>
        )}

        {error && <p className="text-xs text-[#C62828] font-inter">{error}</p>}

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
