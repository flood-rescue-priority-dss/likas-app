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
  let validationError = '';

  validationError =
    validateOfficeName(officeName) ||
    validateCity(city) ||
    (isBarangay
      ? validateZone(zone)
      : validateRegion(region)) ||
    validateContact(contact) ||
    validateReferenceNo(account.officeReferenceNo);

  if (validationError) {
    setError(validationError);
    return;
  }

  setError('');
  setShowConfirm(true);
};

  const validateOfficeName = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) return 'Please fill out the required fields.';
  if (trimmed.length < 3 || trimmed.length > 100) {
    return 'Office Name must be between 3 and 100 characters.';
  }

  return '';
};

const validateCity = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) return 'City/Municipality is required.';

  if (!/^[A-Za-z0-9\s]+$/.test(trimmed)) {
    return 'Only letters and numbers are allowed.';
  }

  return '';
};

const validateRegion = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) return 'Region is required.';

  if (!/^[A-Za-z0-9\s]+$/.test(trimmed)) {
    return 'Only letters and numbers are allowed.';
  }

  return '';
};

const validateZone = (value: string) => {
  if (!value.trim()) return 'Zone is required.';
  return '';
};

const validateContact = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) return 'Office Contact No. is required.';

  if (!/^\+?\d+$/.test(trimmed)) {
    return 'Only numbers and an optional + sign are allowed.';
  }

  if (trimmed.length !== 13) {
    return 'Office Contact No. must be exactly 13 characters.';
  }

  return '';
};

const validateReferenceNo = (value: string) => {
  if (!value.trim()) return 'Office Reference No. is required.';

  if (!/^[A-Za-z0-9-]+$/.test(value)) {
    return 'Only letters, numbers, and hyphens are allowed.';
  }

  return '';
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
  {
    label: 'Office Name',
    value: officeName,
    onChange: setOfficeName,
    type: 'text',
    placeholder: 'Enter office name',
  },
  {
    label: 'City/Municipality',
    value: city,
    onChange: setCity,
    type: 'text',
    placeholder: 'e.g. Manila City',
  },
  isBarangay
    ? {
        label: 'Zone',
        value: zone,
        onChange: setZone,
        type: 'text',
        placeholder: 'e.g. Zone 1',
      }
    : {
        label: 'Region',
        value: region,
        onChange: setRegion,
        type: 'text',
        placeholder: 'e.g. NCR',
      },
  {
    label: 'Office Contact No.',
    value: contact,
    onChange: setContact,
    type: 'tel',
    placeholder: 'e.g. 09XXXXXXXXX or +639XXXXXXXXX',
  },
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
                  placeholder={f.placeholder}
                  onChange={(e) => {
                    let value = e.target.value;

                    if (f.label === 'City/Municipality') {
                      value = value.replace(/[^A-Za-z0-9\s]/g, '');
                    }

                    if (f.label === 'Region') {
                      value = value.replace(/[^A-Za-z0-9\s]/g, '');
                    }

                    if (f.label === 'Office Contact No.') {
                      value = value.replace(/(?!^\+)[^\d]/g, '');

                      if (value.startsWith('+')) {
                        value = '+' + value.substring(1).replace(/\+/g, '');
                      }

                      value = value.slice(0, 13);
                    }

                    f.onChange(value);

                    if (error) {
                      setError('');
                    }
                  }}
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
