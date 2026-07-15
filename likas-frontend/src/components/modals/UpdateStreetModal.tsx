import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { X } from 'lucide-react';

interface UpdateStreetModalProps {
  open: boolean;
  onClose: () => void;
  streetId?: string;
  initialData?: {
    streetName: string;
    population?: number;
    pwd: number;
    elderly: number;
    children: number;
    pregnant: number;
  };
  mode: 'update' | 'add';
  isBarangay?: boolean;
  barangayId?: string;
  onSaved: (data: any) => void;
}

export default function UpdateStreetModal({
  open, onClose, streetId, initialData, mode, isBarangay = false, barangayId, onSaved,
}: UpdateStreetModalProps) {
  const [streetName, setStreetName] = useState(initialData?.streetName ?? '');
  const [population, setPopulation] = useState(String(initialData?.population ?? ''));
  const [pwd, setPwd] = useState(String(initialData?.pwd ?? ''));
  const [elderly, setElderly] = useState(String(initialData?.elderly ?? ''));
  const [children, setChildren] = useState(String(initialData?.children ?? ''));
  const [pregnant, setPregnant] = useState(String(initialData?.pregnant ?? ''));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'review' | 'success'>('form');

  React.useEffect(() => {
    if (open) {
      setStreetName(initialData?.streetName ?? '');
      setPopulation(String(initialData?.population ?? ''));
      setPwd(String(initialData?.pwd ?? ''));
      setElderly(String(initialData?.elderly ?? ''));
      setChildren(String(initialData?.children ?? ''));
      setPregnant(String(initialData?.pregnant ?? ''));
      setError('');
      setStep('form');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const nameLabel = isBarangay ? 'Barangay' : 'Street';

  const handleReview = () => {
    if (!streetName.trim()) { setError(`${nameLabel} name is required.`); return; }
    
    // Validation: Check if anything actually changed
    if (mode === 'update') {
      const hasChanges = 
        streetName.trim() !== (initialData?.streetName ?? '') ||
        (Number(pwd) || 0) !== (initialData?.pwd ?? 0) ||
        (Number(elderly) || 0) !== (initialData?.elderly ?? 0) ||
        (Number(children) || 0) !== (initialData?.children ?? 0) ||
        (Number(pregnant) || 0) !== (initialData?.pregnant ?? 0) ||
        (isBarangay && (Number(population) || 0) !== (initialData?.population ?? 0));
        
      if (!hasChanges) {
        setError("No changes were detected.");
        return;
      }
    }

    setError('');
    setStep('review');
  };

  const confirmSave = async () => {
    setSaving(true);
    setError('');
    try {
      const data: Record<string, any> = {
        streetName: streetName.trim(),
        pwd: Number(pwd) || 0,
        elderly: Number(elderly) || 0,
        children: Number(children) || 0,
        pregnant: Number(pregnant) || 0,
      };
      if (isBarangay) {
        data.population = Number(population) || 0;
        data.name = data.streetName;
      }
      await new Promise(r => setTimeout(r, 500));
      onSaved({ ...data, id: streetId, barangayId });
      setStep('success');
    } catch (e: any) {
      setError(e.message || 'Failed to save.');
      setStep('form');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => { setError(''); onClose(); };

  const title = mode === 'update' ? `Update ${nameLabel}` : `Add ${nameLabel} Record`;

  const fields = [
    { label: nameLabel, value: streetName, onChange: setStreetName, placeholder: `Enter ${nameLabel.toLowerCase()} name`, type: 'text' },
    ...(isBarangay ? [{ label: 'Total Population', value: population, onChange: setPopulation, placeholder: 'Enter total population', type: 'number' }] : []),
    { label: 'PWD',      value: pwd,      onChange: setPwd,      placeholder: 'Enter total PWD',      type: 'number' },
    { label: 'Senior',   value: elderly,  onChange: setElderly,  placeholder: 'Enter total senior',   type: 'number' },
    { label: 'Children', value: children, onChange: setChildren, placeholder: 'Enter total children', type: 'number' },
    { label: 'Pregnant', value: pregnant, onChange: setPregnant, placeholder: 'Enter total pregnant', type: 'number' },
  ];

  if (step === 'success') {
    return (
      <Modal open={open} onClose={handleClose} size="sm" hideHeader>
        <div className="flex flex-col items-center justify-center py-4">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 text-green-500">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <h3 className="font-heading font-bold text-gray-900 text-lg mb-2">
            {mode === 'update' ? 'Update Successful!' : 'Record Added!'}
          </h3>
          <p className="text-gray-500 font-inter text-sm text-center mb-6 px-2">
            The record for <span className="font-semibold text-gray-700">{streetName}</span> has been saved.
          </p>
          <button
            onClick={handleClose}
            className="w-full py-2.5 bg-[#050A30] hover:bg-[#0a1545] text-white font-heading font-semibold text-sm rounded-xl transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </Modal>
    );
  }

  if (step === 'review') {
    return (
      <Modal open={open} onClose={handleClose} size="sm" hideHeader>
        <div className="flex flex-col py-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-[#050A30] text-lg">
              Review Changes
            </h3>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
          <p className="text-gray-500 font-inter text-sm mb-6">
            Please double-check the details for <span className="font-semibold text-gray-700">{streetName}</span> before saving.
          </p>

          <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 space-y-3 text-sm font-inter">
            {isBarangay && (
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="text-gray-500">Total Population</span>
                <span className="font-semibold text-gray-800">{Number(population || 0).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-gray-500">PWD</span>
              <span className="font-semibold text-gray-800">{Number(pwd || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-gray-500">Senior Citizens</span>
              <span className="font-semibold text-gray-800">{Number(elderly || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-gray-500">Children</span>
              <span className="font-semibold text-gray-800">{Number(children || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Pregnant Women</span>
              <span className="font-semibold text-gray-800">{Number(pregnant || 0).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('form')}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-heading font-semibold text-sm rounded-xl transition-colors"
            >
              Back to Edit
            </button>
            <button
              onClick={confirmSave}
              disabled={saving}
              className="flex-1 py-2.5 bg-[#050A30] hover:bg-[#0a1545] disabled:opacity-60 text-white font-heading font-semibold text-sm rounded-xl transition-colors shadow-sm"
            >
              {saving ? 'Saving...' : 'Confirm & Save'}
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose} size="md" hideHeader>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading font-bold text-[#050A30] text-xl">{title}</h2>
        <button
          onClick={handleClose}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
        >
          <X size={15} />
        </button>
      </div>

      {/* Fields — stacked on mobile, label-input row on sm+ */}
      <div className="space-y-4">
        {fields.map(f => (
          <div key={f.label} className="flex flex-col sm:grid sm:grid-cols-5 sm:items-center gap-1 sm:gap-4">
            <label className="text-sm font-inter font-medium text-gray-600 sm:col-span-2">{f.label}</label>
            <input
              type={f.type}
              value={f.value}
              onChange={e => f.onChange(e.target.value)}
              placeholder={f.placeholder}
              min={f.type === 'number' ? 0 : undefined}
              className="w-full sm:col-span-3 px-4 py-3 border border-gray-200 rounded-xl text-sm font-inter bg-white focus:outline-none focus:ring-2 focus:ring-[#050A30]/30 focus:border-[#050A30] transition-colors"
            />
          </div>
        ))}

        {error && <p className="text-xs text-[#C62828] font-inter mt-1 font-semibold">{error}</p>}

        {/* Footer */}
        <div className="border-t border-gray-100 pt-4 flex gap-3 mt-2">
          <button
            onClick={handleClose}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-heading font-semibold text-sm rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleReview}
            className="flex-1 py-3 bg-[#050A30] hover:bg-[#0a1545] disabled:opacity-60 text-white font-heading font-semibold text-sm rounded-xl transition-colors"
          >
            Review Changes
          </button>
        </div>
      </div>
    </Modal>
  );
}
