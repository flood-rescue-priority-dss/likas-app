import React, { useState } from 'react';
import { X } from 'lucide-react';
import ConfirmPasswordModal from '../ui/ConfirmPasswordModal';
import InfoTooltip from '../ui/InfoTooltip';
import { authService } from '../../services';
import type { UserAccount } from '../../types';

interface EditOfficeDetailsModalProps {
  open: boolean;
  onClose: () => void;
  account: UserAccount;
  onSaved: (updated: UserAccount) => void;
}

export default function EditOfficeDetailsModal({
  open, onClose, account, onSaved,
}: EditOfficeDetailsModalProps) {
  const [officeName, setOfficeName] = useState(account.officeName);
  const [city, setCity] = useState(account.cityMunicipality);
  const [zone, setZone] = useState(account.zone ?? '');
  const [region, setRegion] = useState(account.region ?? '');
  const [contact, setContact] = useState(account.officeContact);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const isBarangay = account.role === 'barangay';

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

  if (!open) return null;

  const validateOfficeName = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return 'Please fill out the required fields.';
    if (trimmed.length < 3 || trimmed.length > 100) return 'Office Name must be between 3 and 100 characters.';
    return '';
  };

  const validateCity = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return 'City/Municipality is required.';
    if (!/^[A-Za-z0-9\s]+$/.test(trimmed)) return 'Only letters and numbers are allowed.';
    return '';
  };

  const validateRegion = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return 'Region is required.';
    if (!/^[A-Za-z0-9\s]+$/.test(trimmed)) return 'Only letters and numbers are allowed.';
    return '';
  };

  const validateZone = (value: string) => {
    if (!value.trim()) return 'Zone is required.';
    return '';
  };

  const validateContact = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return 'Office Contact No. is required.';
    if (!/^\+?\d+$/.test(trimmed)) return 'Only numbers and an optional + sign are allowed.';
    if (trimmed.length !== 13) return 'Office Contact No. must be exactly 13 characters.';
    return '';
  };

  const validateReferenceNo = (value: string) => {
    if (!value.trim()) return 'Office Reference No. is required.';
    if (!/^[A-Za-z0-9-]+$/.test(value)) return 'Only letters, numbers, and hyphens are allowed.';
    return '';
  };

  const handleSaveClick = () => {
    const validationError =
      validateOfficeName(officeName) ||
      validateCity(city) ||
      (isBarangay ? validateZone(zone) : validateRegion(region)) ||
      validateContact(contact) ||
      validateReferenceNo(account.officeReferenceNo);
    if (validationError) { setError(validationError); return; }
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

  const formFields = [
    { label: 'Office Name', value: officeName, onChange: setOfficeName, type: 'text', placeholder: 'Enter office name' },
    { label: 'City/Municipality', value: city, onChange: setCity, type: 'text', placeholder: 'e.g. Manila City' },
    isBarangay
      ? { label: 'Zone', value: zone, onChange: setZone, type: 'text', placeholder: 'e.g. Zone 1' }
      : { label: 'Region', value: region, onChange: setRegion, type: 'text', placeholder: 'e.g. NCR' },
    { label: 'Office Contact No.', value: contact, onChange: setContact, type: 'tel', placeholder: 'e.g. +639XXXXXXXXX' },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 sm:p-4">
        <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-xl w-full sm:max-w-xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-inter uppercase text-gray-400">Edit Office Details</h3>
            <div className="flex items-center gap-2">
              <InfoTooltip />
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {formFields.map(f => (
              <div key={f.label} className="flex flex-col sm:grid sm:grid-cols-5 sm:items-center gap-1 sm:gap-4">
                <label className="text-sm font-inter font-medium text-gray-600 sm:col-span-2">{f.label}</label>
                <input
                  type={f.type}
                  value={f.value}
                  placeholder={f.placeholder}
                  onChange={(e) => {
                    let value = e.target.value;
                    if (f.label === 'City/Municipality' || f.label === 'Region') {
                      value = value.replace(/[^A-Za-z0-9\s]/g, '');
                    }
                    if (f.label === 'Office Contact No.') {
                      value = value.replace(/(?!^\+)[^\d]/g, '');
                      if (value.startsWith('+')) value = '+' + value.substring(1).replace(/\+/g, '');
                      value = value.slice(0, 13);
                    }
                    f.onChange(value);
                    if (error) setError('');
                  }}
                  className="w-full sm:col-span-3 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-inter bg-[#F8F9FC] focus:outline-none focus:ring-2 focus:ring-[#1B75BC]/30 focus:border-[#1B75BC] focus:bg-white transition-all"
                />
              </div>
            ))}

            {/* Readonly reference number */}
            <div className="flex flex-col sm:grid sm:grid-cols-5 sm:items-center gap-1 sm:gap-8">
              <label className="text-sm font-inter font-medium text-gray-600 sm:col-span-2">Office Reference No.</label>
              <span className="w-full sm:col-span-3 px-4 py-2.5 text-sm font-inter text-gray-400 bg-gray-50 rounded-xl border border-transparent">
                {account.officeReferenceNo}
              </span>
            </div>

            {error && <p className="text-xs text-[#C62828] font-inter">{error}</p>}
          </div>

          <div className="border-t border-gray-100 pt-5 flex flex-col-reverse sm:flex-row sm:justify-between gap-3 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-heading font-semibold text-sm rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveClick}
              disabled={loading}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#050A30] hover:bg-[#0a1545] disabled:opacity-60 text-white font-heading font-semibold text-sm rounded-xl transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <ConfirmPasswordModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
