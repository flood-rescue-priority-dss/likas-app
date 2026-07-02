import React, { useState } from 'react';
import AppShell from '../components/layout/AppShell';
import EditOfficeDetailsModal from '../components/modals/EditOfficeDetailsModal';
import { useAuth } from '../contexts/AuthContext';
import type { UserAccount } from '../types';
import { format } from 'date-fns';

function DetailRow({ label, value, link }: { label: string; value: React.ReactNode; link?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <span className="text-sm font-inter text-gray-500 w-40 flex-shrink-0">{label}</span>
      <span className="flex-1 text-sm font-inter font-medium text-gray-800">{value}</span>
      {link && (
        <a href="#" className="text-sm font-inter font-medium text-[#1B75BC] hover:underline ml-4 flex-shrink-0">
          Change
        </a>
      )}
    </div>
  );
}

export default function AccountSettingsPage() {
  const { user, updateUser } = useAuth();
  const [editOpen, setEditOpen] = useState(false);

  if (!user) return null;

  const isBarangay = user.role === 'barangay';

  const handleSaved = (updated: UserAccount) => {
    updateUser(updated);
  };

  const formatDate = (iso: string) => {
    try {
      return format(new Date(iso), 'MMM d, yyyy, h:mm aa');
    } catch {
      return iso;
    }
  };

  return (
    <AppShell defaultExpanded>
      <div className="p-10 max-w-3xl">
        <h1 className="text-2xl font-heading font-bold text-gray-900 mb-8">Account Settings</h1>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Card heading */}
          <div className="px-8 pt-8 pb-4">
            <h2 className="text-3xl font-heading font-black text-gray-900">{user.officeName}</h2>
          </div>
          <div className="mx-8 border-t border-gray-100" />

          {/* Office Details */}
          <div className="px-8 pt-6 pb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-inter text-gray-400 uppercase tracking-widest">Office details</p>
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
              {isBarangay
                ? <DetailRow label="Zone" value={user.zone ?? '—'} />
                : <DetailRow label="Region" value={user.region ?? '—'} />
              }
              <DetailRow label="Office Contact" value={user.officeContact} />
              <DetailRow label="Office Reference No." value={user.officeReferenceNo} />
            </div>
          </div>

          <div className="mx-8 border-t border-gray-100" />

          {/* Account Access */}
          <div className="px-8 pt-6 pb-8">
            <p className="text-xs font-inter text-gray-400 uppercase tracking-widest mb-3">Account access</p>
            <div>
              <DetailRow label="Registered email" value={user.registeredEmail} link />
              <DetailRow label="Password" value="••••••••••••" link />
              <DetailRow label="Role" value={
                <span className="capitalize">{user.role === 'admin' ? 'Administrator' : 'Barangay'}</span>
              } />
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
    </AppShell>
  );
}
