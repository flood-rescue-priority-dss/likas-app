import React, { useRef, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import EditOfficeDetailsModal from '../components/modals/EditOfficeDetailsModal';
import ChangePasswordModal from '../components/modals/ChangePasswordModal';
import { useAuth } from '../contexts/AuthContext';
import type { UserAccount } from '../types';
import { format } from 'date-fns';
import PageHeader from '../components/ui/PageHeader';

function DetailRow({
  label,
  value,
  link,
  onLinkClick,
}: {
  label: string;
  value: React.ReactNode;
  link?: boolean;
  onLinkClick?: () => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-gray-50 last:border-0 gap-1 sm:gap-0">
      <span className="text-sm font-inter text-gray-500 sm:w-40 flex-shrink-0">{label}</span>
      <span className="flex-1 text-sm font-inter font-medium text-gray-800 break-all sm:break-normal">{value}</span>
      {link && (
        <button
          onClick={onLinkClick}
          className="text-sm font-inter font-medium text-[#1B75BC] hover:underline sm:ml-4 flex-shrink-0 text-left sm:text-right"
        >
          Change
        </button>
      )}
    </div>
  );
}

export default function AccountSettingsPage() {
  const { user, updateUser } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const savedSuccessTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!user) return null;

  const isBarangay = user.role === 'barangay';

  const handleSaved = (updated: UserAccount) => {
    updateUser(updated);
    setSavedSuccess(true);
    if (savedSuccessTimer.current) clearTimeout(savedSuccessTimer.current);
    savedSuccessTimer.current = setTimeout(() => setSavedSuccess(false), 3000);
  };

  const formatDate = (iso: string) => {
    try {
      const date = new Date(iso);
      const phDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
      return format(phDate, 'MMM d, yyyy, h:mm aa');
    } catch {
      return iso;
    }
  };

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-10 max-w-3xl relative">
        <PageHeader title="ACCOUNT SETTINGS" titleUppercase />

        {savedSuccess && (
          <div className="absolute top-6 right-4 sm:right-6 lg:right-10 z-50 flex items-center gap-3 bg-emerald-50 border border-emerald-300 shadow-lg text-emerald-800 rounded-xl px-5 py-4 animate-fadeIn">
            <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
            <p className="text-sm font-inter font-medium whitespace-nowrap">Account details updated successfully.</p>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Card heading */}
          <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4">
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-gray-900 break-words">{user.officeName}</h2>
          </div>

          <div className="mx-6 sm:mx-8 border-t border-gray-100" />

          {/* Office Details */}
          <div className="px-6 sm:px-8 pt-6 pb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-inter uppercase text-gray-400">Office details</p>
              <button
                id="edit-details-btn"
                onClick={() => setEditOpen(true)}
                className="px-4 py-2 bg-[#050A30] hover:bg-[#0a1545] text-white font-heading font-semibold text-sm rounded-xl transition-colors"
              >
                Edit Details
              </button>
            </div>
            <div>
              <DetailRow label="City/Municipality" value={user.cityMunicipality} />
              {isBarangay ? (
                <DetailRow label="Zone" value={user.zone ?? '—'} />
              ) : (
                <DetailRow label="Region" value={user.region ?? '—'} />
              )}
              <DetailRow label="Office Contact" value={user.officeContact} />
              <DetailRow label="Office Reference No." value={user.officeReferenceNo} />
            </div>
          </div>

          <div className="mx-6 sm:mx-8 border-t border-gray-100" />

          {/* Account Access */}
          <div className="px-8 pt-6 pb-8">
            <p className="text-sm font-inter uppercase text-gray-400 mb-3">Account access</p>
            <div>
              <DetailRow
                label="Registered email"
                value={user.registeredEmail}
              />
              <DetailRow
                label="Password"
                value="••••••••••••"
                link
                onLinkClick={() => setPwModalOpen(true)}
              />
              <DetailRow
                label="Role"
                value={<span className="capitalize">{user.role === 'admin' ? 'Administrator' : 'Barangay'}</span>}
              />
              <DetailRow label="Last login" value={formatDate(user.lastLogin)} />
            </div>
          </div>
        </div>
      </div>

      <EditOfficeDetailsModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        account={user}
        onSaved={handleSaved}
      />
      <ChangePasswordModal open={pwModalOpen} onClose={() => setPwModalOpen(false)} />
    </>
  );
}