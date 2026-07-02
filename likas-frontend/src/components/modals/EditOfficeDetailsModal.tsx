import React, { useState } from 'react';
import Modal from '../ui/Modal';
import InfoTooltip from '../ui/InfoTooltip';
import ConfirmPasswordModal from '../ui/ConfirmPasswordModal';
import { authService } from '../../services';
import type { UserAccount } from '../../types';

interface EditOfficeDetailsModalProps {
  open: boolean;
  onClose: () => void;
  account: UserAccount;
  onSaved: (updated: UserAccount) => void;
}

export default function EditOfficeDetailsModal({
  open, onClose, account, onSaved
}: EditOfficeDetailsModalProps) {
  const [officeName, setOfficeName] = useState(account.officeName);
  const [city, setCity] = useState(account.cityMunicipality);
  const [zone, setZone] = useState(account.zone ?? '');
  const [region, setRegion] = useState(account.region ?? '');
  const [contact, setContact] = useState(account.officeContact);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  React.useEffect(() => {
    if (open) {
      setOfficeName(account.officeName);
      setCity(account.cityMunicipality);
      setZone(account.zone ?? '');
      setRegion(account.region ?? '');
      setContact(account.officeContact);
      setError('');
    }
  }, [open, account]);

  const handleSaveClick = () => {
    if (!officeName || !city || !contact) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setShowConfirm(true);
  };

  const handleConfirm = async (password: string) => {
    const ok = await authService.verifyPassword(account.registeredEmail, password);
    if (!ok) throw new Error('Incorrect password. Please try again.');

    setLoading(true);
    try {
      const updates: Partial<UserAccount> = {
        officeName,
        cityMunicipality: city,
        officeContact: contact,
        ...(account.role === 'barangay' ? { zone } : { region }),
      };
      const updated = await authService.updateOfficeDetails(account.id, updates);
      onSaved(updated);
      setShowConfirm(false);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const isBarangay = account.role === 'barangay';

  const formFields = [
    { label: 'Office Name', value: officeName, onChange: setOfficeName, type: 'text' },
    { label: 'City/Municipality', value: city, onChange: setCity, type: 'text' },
    isBarangay
      ? { label: 'Zone', value: zone, onChange: setZone, type: 'text' }
      : { label: 'Region', value: region, onChange: setRegion, type: 'text' },
    { label: 'Office Contact No.', value: contact, onChange: setContact, type: 'tel' },
  ];

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Edit Office Details"
        size="lg"
        headerRight={<InfoTooltip />}
      >
        <div className="space-y-4">
          {formFields.map(f => (
            <div key={f.label} className="grid grid-cols-5 items-center gap-4">
              <label className="col-span-2 text-sm font-inter font-medium text-gray-600">{f.label}</label>
              <input
                type={f.type}
                value={f.value}
                onChange={e => f.onChange(e.target.value)}
                className="col-span-3 px-4 py-3 border border-gray-200 rounded-xl text-sm font-inter bg-white focus:outline-none focus:ring-2 focus:ring-[#1B75BC]/30 focus:border-[#1B75BC]"
              />
            </div>
          ))}

          {/* Readonly reference number */}
          <div className="grid grid-cols-5 items-center gap-4">
            <label className="col-span-2 text-sm font-inter font-medium text-gray-600">Office Reference No.</label>
            <span className="col-span-3 px-4 py-3 text-sm font-inter text-gray-400 bg-gray-50 rounded-xl border border-transparent">
              {account.officeReferenceNo}
            </span>
          </div>

          {error && <p className="text-xs text-[#C62828] font-inter">{error}</p>}

          <div className="border-t border-gray-100 pt-4 flex gap-3 mt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-heading font-semibold text-sm rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveClick}
              disabled={loading}
              className="flex-1 py-3 bg-[#050A30] hover:bg-[#0a1545] disabled:opacity-60 text-white font-heading font-semibold text-sm rounded-xl transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmPasswordModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
