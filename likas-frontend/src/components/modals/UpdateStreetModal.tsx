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

  // Re-populate fields whenever a different row is opened
  React.useEffect(() => {
    if (open) {
      setStreetName(initialData?.streetName ?? '');
      setPopulation(String(initialData?.population ?? ''));
      setPwd(String(initialData?.pwd ?? ''));
      setElderly(String(initialData?.elderly ?? ''));
      setChildren(String(initialData?.children ?? ''));
      setPregnant(String(initialData?.pregnant ?? ''));
      setError('');
    }
  }, [open, initialData]);

  const nameLabel = isBarangay ? 'Barangay' : 'Street';

  const handleSave = async () => {
    if (!streetName.trim()) {
      setError(`${nameLabel} name is required.`);
      return;
    }
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
        // Map back to the barangay shape expected by handleSaved
        data.name = data.streetName;
      }
      // Replace with real API call when backend is ready
      await new Promise(r => setTimeout(r, 500));
      onSaved({ ...data, id: streetId, barangayId });
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => { setError(''); onClose(); };

  const title = mode === 'update' ? `Update ${nameLabel}` : `Add ${nameLabel} Record`;

  // Build field list — insert Total Population after the name field for admin (barangay) view
  const fields = [
    {
      label: nameLabel,
      value: streetName,
      onChange: setStreetName,
      placeholder: `Enter ${nameLabel.toLowerCase()} name`,
      type: 'text',
    },
    ...(isBarangay
      ? [{
          label: 'Total Population',
          value: population,
          onChange: setPopulation,
          placeholder: 'Enter total population',
          type: 'number',
        }]
      : []),
    { label: 'PWD',      value: pwd,      onChange: setPwd,      placeholder: 'Enter total PWD',      type: 'number' },
    { label: 'Senior',   value: elderly,  onChange: setElderly,  placeholder: 'Enter total senior',   type: 'number' },
    { label: 'Children', value: children, onChange: setChildren, placeholder: 'Enter total children', type: 'number' },
    { label: 'Pregnant', value: pregnant, onChange: setPregnant, placeholder: 'Enter total pregnant', type: 'number' },
  ];

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

      {/* Fields */}
      <div className="space-y-4">
        {fields.map(f => (
          <div key={f.label} className="grid grid-cols-5 items-center gap-4">
            <label className="col-span-2 text-sm font-inter font-medium text-gray-600">
              {f.label}
            </label>
            <input
              type={f.type}
              value={f.value}
              onChange={e => f.onChange(e.target.value)}
              placeholder={f.placeholder}
              min={f.type === 'number' ? 0 : undefined}
              className="col-span-3 px-4 py-3 border border-gray-200 rounded-xl text-sm font-inter bg-white focus:outline-none focus:ring-2 focus:ring-[#1B75BC]/30 focus:border-[#1B75BC] transition-colors"
            />
          </div>
        ))}

        {error && <p className="text-xs text-[#C62828] font-inter mt-1">{error}</p>}

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
            disabled={saving}
            className="flex-1 py-3 bg-[#050A30] hover:bg-[#0a1545] disabled:opacity-60 text-white font-heading font-semibold text-sm rounded-xl transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
