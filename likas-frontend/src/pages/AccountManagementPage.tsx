import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, Search, Plus, Edit, Archive, X, UsersRound, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { authService } from '../services';
import ConfirmPasswordModal from '../components/modals/ConfirmPasswordModal';
import Modal from '../components/ui/Modal';
import { format } from 'date-fns';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Account {
  id: string;
  office_name: string;
  office_reference_no: string;
  city_municipality: string;
  zone: string;
  registered_email: string;
  status: string;
  archived_at?: string;
}

export default function AccountManagementPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createStep, setCreateStep] = useState<'form' | 'overview'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedCreds, setGeneratedCreds] = useState({ email: '', password: '' });
  
  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editStep, setEditStep] = useState<'form' | 'overview'>('form');
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [isNoChangesModalOpen, setIsNoChangesModalOpen] = useState(false);

  // Validation Error Modal
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [editFormError, setEditFormError] = useState('');

  // Archive State
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isArchiveConfirmModalOpen, setIsArchiveConfirmModalOpen] = useState(false);
  const [archivingAccountId, setArchivingAccountId] = useState<string | null>(null);

  // Pagination State
  const [entries, setEntries] = useState<number>(10);
  const [page, setPage] = useState(1);

  // Archived Details State
  const [isArchivedDetailsModalOpen, setIsArchivedDetailsModalOpen] = useState(false);
  const [selectedArchivedAccount, setSelectedArchivedAccount] = useState<Account | null>(null);
  
  // Reactivate State
  const [isReactivateConfirmModalOpen, setIsReactivateConfirmModalOpen] = useState(false);
  const [reactivatingAccountId, setReactivatingAccountId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    office_name: '',
    office_reference_no: '',
    city_municipality: '',
    zone: '',
    email: '',
    password: ''
  });

  const fetchAccounts = async () => {
    try {
      const response = await fetch(`${API_BASE}/accounts`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('likas_token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAccounts();
    }
  }, [user]);

  const handleProceedToOverview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // Validate Barangay Name
      const valResponse = await fetch(`${API_BASE}/accounts/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('likas_token')}`
        },
        body: JSON.stringify({ office_name: formData.office_name })
      });

      if (!valResponse.ok) {
        const valData = await valResponse.json();
        setErrorMessage(valData.error || 'Invalid barangay. Please ensure the name is correct and the account does not already exist.');
        setErrorModalOpen(true);
        setIsSubmitting(false);
        return;
      }

      // Verify admin password
      try {
        await authService.verifyPassword(formData.password);
      } catch (err) {
        setErrorMessage('Incorrect admin password. Please try again.');
        setErrorModalOpen(true);
        setIsSubmitting(false);
        return;
      }

      // Generate credentials
      const refNum = formData.office_reference_no.replace(/^(MLA-)?BRGY-/i, '');
      setGeneratedCreds({
        email: `manila.brgy-${refNum}@gov.ph`.toLowerCase(),
        password: Math.random().toString(36).slice(-8).toUpperCase()
      });
      
      setCreateStep('overview');
    } catch (error) {
      console.error('Error verifying password:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmCreate = async () => {
    setIsSubmitting(true);
    
    const payload = {
      ...formData,
      email: generatedCreds.email,
      password: generatedCreds.password
    };

    try {
      const response = await fetch(`${API_BASE}/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('likas_token')}`
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        setIsModalOpen(false);
        setCreateStep('form');
        setFormData({
          office_name: '',
          office_reference_no: '',
          city_municipality: '',
          zone: '',
          email: '',
          password: ''
        });
        setGeneratedCreds({ email: '', password: '' });
        fetchAccounts();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create account');
      }
    } catch (error) {
      console.error('Error creating account:', error);
      alert('Error creating account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (acc: Account) => {
    setFormData({
      office_name: acc.office_name || '',
      office_reference_no: acc.office_reference_no || '',
      city_municipality: acc.city_municipality || '',
      zone: acc.zone || '',
      email: acc.registered_email || '',
      password: ''
    });
    setEditingAccountId(acc.id);
    setEditStep('form');
    setEditFormError('');
    setIsEditModalOpen(true);
  };

  const handleProceedToEditOverview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccountId) return;
    
    const originalAccount = accounts.find(a => a.id === editingAccountId);
    if (!originalAccount) return;
    
    // Check if any fields actually changed
    const hasChanges = 
      formData.office_name !== originalAccount.office_name ||
      formData.office_reference_no !== originalAccount.office_reference_no ||
      formData.zone !== (originalAccount.zone || '') ||
      formData.email !== (originalAccount.registered_email || '');
      
    if (!hasChanges) {
      setEditFormError('No changes were made. Please modify the details to update the account.');
      return;
    }
    
    setEditFormError('');
    
    // Validate new Barangay Name if it was changed
    if (formData.office_name !== originalAccount.office_name) {
      setIsSubmitting(true);
      fetch(`${API_BASE}/accounts/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('likas_token')}`
        },
        body: JSON.stringify({ office_name: formData.office_name })
      }).then(async (valResponse) => {
        if (!valResponse.ok) {
          const valData = await valResponse.json();
          setErrorMessage(valData.error || 'Invalid barangay. Please ensure the name is correct and the account does not already exist.');
          setErrorModalOpen(true);
          setIsSubmitting(false);
          return;
        }
        setIsSubmitting(false);
        setEditStep('overview');
      }).catch(err => {
        console.error(err);
        setErrorMessage('Validation failed due to network error.');
        setErrorModalOpen(true);
        setIsSubmitting(false);
      });
    } else {
      setEditStep('overview');
    }
  };

  const handleConfirmEdit = async () => {
    if (!editingAccountId) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/accounts/${editingAccountId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('likas_token')}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setIsEditModalOpen(false);
        setEditingAccountId(null);
        setEditStep('form');
        fetchAccounts();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update account');
      }
    } catch (error) {
      console.error('Error updating account:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const promptArchive = (id: string) => {
    setArchivingAccountId(id);
    setIsArchiveModalOpen(true);
  };

  const handleArchive = async (password: string) => {
    if (!archivingAccountId || !user) return;
    setIsSubmitting(true);
    
    try {
      // Verify password
      try {
        await authService.verifyPassword(password);
      } catch (err) {
        throw new Error('Incorrect password. Please try again.');
      }

      // Password is correct, now ask for final confirmation
      setIsArchiveModalOpen(false);
      setIsArchiveConfirmModalOpen(true);
    } catch (error) {
      if (error instanceof Error) {
        throw error; // Re-throw so ConfirmPasswordModal can catch it
      }
      console.error('Error verifying password:', error);
      throw new Error('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalArchive = async () => {
    if (!archivingAccountId) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/accounts/${archivingAccountId}/archive`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('likas_token')}` }
      });
      if (response.ok) {
        setIsArchiveConfirmModalOpen(false);
        setArchivingAccountId(null);
        fetchAccounts();
      }
    } catch (error) {
      console.error('Error archiving account:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openArchivedDetails = (acc: Account) => {
    setSelectedArchivedAccount(acc);
    setIsArchivedDetailsModalOpen(true);
  };

  const promptReactivate = (id: string) => {
    setReactivatingAccountId(id);
    setIsReactivateConfirmModalOpen(true);
  };

  const handleConfirmReactivate = async () => {
    if (!reactivatingAccountId) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/accounts/${reactivatingAccountId}/reactivate`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('likas_token')}` }
      });
      if (response.ok) {
        setIsReactivateConfirmModalOpen(false);
        setReactivatingAccountId(null);
        setIsArchivedDetailsModalOpen(false);
        setSelectedArchivedAccount(null);
        fetchAccounts();
      }
    } catch (error) {
      console.error('Error reactivating account:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = 
      acc.office_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (acc.registered_email && acc.registered_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      acc.office_reference_no.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All Status' || 
                          (statusFilter === 'Active' && acc.status !== 'Archived') ||
                          (statusFilter === 'Archived' && acc.status === 'Archived');
                          
    return matchesSearch && matchesStatus;
  });

  // --- Pagination Logic ---
  const totalPages = Math.max(1, Math.ceil(filteredAccounts.length / entries));
  const startIdx = (page - 1) * entries;
  const paginatedAccounts = filteredAccounts.slice(startIdx, startIdx + entries);
  
  // Reset to page 1 if data or entries change
  useEffect(() => { setPage(1); }, [searchTerm, statusFilter, entries, accounts.length]);

  const goToPage = (p: number) => setPage(Math.max(1, Math.min(totalPages, p)));

  const WINDOW = 5;
  const windowStart = Math.floor((page - 1) / WINDOW) * WINDOW + 1;
  const windowEnd = Math.min(windowStart + WINDOW - 1, totalPages);
  const pageButtons = Array.from({ length: windowEnd - windowStart + 1 }, (_, i) => windowStart + i);

  const activeAccounts = accounts.filter(a => a.status !== 'Archived').length;
  const archivedAccounts = accounts.filter(a => a.status === 'Archived').length;

  const handleOpenCreateModal = () => {
    setFormData({
      office_name: '',
      office_reference_no: '',
      city_municipality: '',
      zone: '',
      email: '',
      password: ''
    });
    setCreateStep('form');
    setGeneratedCreds({ email: '', password: '' });
    setIsModalOpen(true);
  };

  return (
    <div className="p-10">
      <PageHeader
        title="ACCOUNT MANAGEMENT"
        breadcrumbs={[{ label: 'Create and manage barangay official accounts', muted: true }]}
        action={
          <button 
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#050A30] hover:bg-[#0a1545] text-white rounded-xl font-heading font-semibold text-sm transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span>Create Account</span>
          </button>
        }
      />

      <main className="w-full">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Total Accounts</p>
              <h3 className="text-3xl font-heading font-bold text-gray-900">{accounts.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#1B75BC]">
              <UsersRound size={24} />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Active Accounts</p>
              <h3 className="text-3xl font-heading font-bold text-green-600">{activeAccounts}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <UserCheck size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Archived Accounts</p>
              <h3 className="text-3xl font-heading font-bold text-red-600">{archivedAccounts}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <UserX size={24} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#1B75BC] transition-colors text-sm"
            />
          </div>
          <div className="relative min-w-[150px]">
            <select 
              className="w-full px-4 py-2 pr-10 appearance-none bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#1B75BC] text-sm text-gray-700"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Archived</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-inter font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">No.</th>
                  <th className="px-6 py-4 text-xs font-inter font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Barangay Name</th>
                  <th className="px-6 py-4 text-xs font-inter font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Reference ID</th>
                  <th className="px-6 py-4 text-xs font-inter font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Location</th>
                  <th className="px-6 py-4 text-xs font-inter font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Email</th>
                  <th className="px-6 py-4 text-xs font-inter font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 text-xs font-inter font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="spinner-dark mx-auto" />
                    </td>
                  </tr>
                ) : paginatedAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 font-inter">
                      No accounts found matching your search.
                    </td>
                  </tr>
                ) : (
                  paginatedAccounts.map((acc, i) => (
                    <tr key={acc.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-500">{startIdx + i + 1}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{acc.office_name}</td>
                      <td className="px-6 py-4 text-gray-500">{acc.office_reference_no}</td>
                      <td className="px-6 py-4 text-gray-500">{acc.city_municipality}{acc.zone ? `, ${acc.zone}` : ''}</td>
                      <td className="px-6 py-4 text-gray-500">{acc.registered_email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          acc.status !== 'Archived' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {acc.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {acc.status === 'Archived' ? (
                            <button 
                              onClick={() => openArchivedDetails(acc)}
                              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                            >
                              Details
                            </button>
                          ) : (
                            <>
                              <button 
                                onClick={() => openEditModal(acc)}
                                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-[#1B75BC] hover:bg-blue-50 rounded-lg transition-colors border border-gray-200">
                                Edit
                              </button>
                              <button 
                                onClick={() => promptArchive(acc.id)}
                                className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors border border-red-600"
                              >
                                Archive
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0 bg-white rounded-b-2xl">
            <div className="flex items-center gap-1.5 text-xs font-inter text-gray-400 flex-shrink-0">
              <span>Show</span>
              <select
                value={entries}
                onChange={(e) => setEntries(Number(e.target.value))}
                className="border border-gray-200 rounded-lg pl-2 pr-6 py-1 text-xs font-inter font-medium text-gray-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#1B75BC] cursor-pointer appearance-none bg-no-repeat bg-[right_0.4rem_center] bg-[length:10px]"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6' fill='none'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")" }}
              >
                {[10, 25, 50, 100, 150, 200].map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <span>entries of {filteredAccounts.length}</span>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>

                <div className="flex items-center gap-1">
                  {pageButtons.map(p => (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-inter font-semibold transition-all duration-200 ${
                        p === page
                          ? 'bg-[#050A30] text-white scale-105 shadow-sm'
                          : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1B75BC]">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-heading font-bold text-gray-900">
                    {createStep === 'form' ? 'Create New Account' : 'Account Overview'}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {createStep === 'form' 
                      ? 'Enter the details for the new barangay account.' 
                      : 'Please review the details before confirming.'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => { setIsModalOpen(false); setCreateStep('form'); setGeneratedCreds({ email: '', password: ''}); }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            {createStep === 'form' ? (
              <form onSubmit={handleProceedToOverview} className="p-6 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Barangay Name <span className="text-red-500">*</span></label>
                    <div className="flex bg-gray-50 border border-gray-200 rounded-lg focus-within:border-[#1B75BC] focus-within:bg-white transition-all overflow-hidden text-sm">
                      <span className="flex items-center pl-4 pr-2 text-gray-500 font-medium bg-gray-100 border-r border-gray-200 whitespace-nowrap">
                        Barangay
                      </span>
                      <input 
                        required
                        type="text" 
                        placeholder="123"
                        className="w-full px-3 py-2 bg-transparent focus:outline-none"
                        value={formData.office_name.replace(/^Barangay\s*/i, '')}
                        onChange={e => {
                          const val = e.target.value;
                          setFormData({
                            ...formData, 
                            office_name: 'Barangay ' + val,
                            office_reference_no: 'MLA-BRGY-' + val.toUpperCase().replace(/\s+/g, '')
                          });
                        }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Reference ID <span className="text-red-500">*</span></label>
                    <div className="flex bg-gray-50 border border-gray-200 rounded-lg focus-within:border-[#1B75BC] focus-within:bg-white transition-all overflow-hidden text-sm">
                      <span className="flex items-center pl-4 pr-2 text-gray-500 font-medium bg-gray-100 border-r border-gray-200 whitespace-nowrap">
                        MLA-BRGY-
                      </span>
                      <input 
                        required
                        type="text" 
                        placeholder="123"
                        className="w-full px-3 py-2 bg-transparent focus:outline-none"
                        value={formData.office_reference_no.replace(/^(MLA-)?BRGY-/i, '')}
                        onChange={e => setFormData({...formData, office_reference_no: 'MLA-BRGY-' + e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Zone</label>
                    <input 
                      type="text" 
                      autoComplete="off"
                      placeholder="e.g. Zone 1"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1B75BC] focus:bg-white transition-all text-sm"
                      value={formData.zone}
                      onChange={e => setFormData({...formData, zone: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Admin Password <span className="text-red-500">*</span></label>
                      <input 
                        required
                        type="password" 
                        autoComplete="new-password"
                        placeholder="Enter your admin password"
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1B75BC] focus:bg-white transition-all text-sm"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                      />
                      <p className="text-xs text-gray-400 mt-1.5">For security, please enter your password to authorize this action.</p>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                  <button 
                    type="button"
                    onClick={() => { setIsModalOpen(false); setCreateStep('form'); setGeneratedCreds({ email: '', password: ''}); }}
                    className="px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 text-sm font-semibold text-white bg-[#050A30] hover:bg-[#0a1545] rounded-lg transition-colors flex items-center justify-center min-w-[140px] disabled:opacity-70"
                  >
                    {isSubmitting ? 'Verifying...' : 'Review Details'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6 overflow-y-auto">
                <div className="space-y-4 mb-8">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Barangay Name</p>
                    <p className="font-medium text-gray-900">{formData.office_name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Reference ID</p>
                    <p className="font-medium text-gray-900">{formData.office_reference_no}</p>
                  </div>
                  {formData.zone && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Zone</p>
                      <p className="font-medium text-gray-900">{formData.zone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email Address</p>
                    <p className="font-medium text-gray-900">{generatedCreds.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Temporary Password</p>
                    <p className="font-medium text-gray-900">{generatedCreds.password}</p>
                    <p className="text-xs text-amber-600 mt-1 bg-amber-50 inline-block px-2 py-1 rounded">Please save this password. It will only be shown once.</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t border-gray-100">
                  <button 
                    type="button"
                    onClick={() => setCreateStep('form')}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Back to Edit
                  </button>
                  <button 
                    onClick={handleConfirmCreate}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-[#050A30] hover:bg-[#0a1545] rounded-lg transition-colors disabled:opacity-70 flex items-center justify-center"
                  >
                    {isSubmitting ? 'Creating...' : 'Confirm & Create'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Account Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1B75BC]">
                  <Edit size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-heading font-bold text-gray-900">Edit Account</h2>
                  <p className="text-xs text-gray-500">Update the details for the barangay account.</p>
                </div>
              </div>
              <button 
                onClick={() => { setIsEditModalOpen(false); setEditStep('form'); }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            {editStep === 'form' ? (
              <form onSubmit={handleProceedToEditOverview} className="p-6 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Barangay Name <span className="text-red-500">*</span></label>
                    <div className="flex bg-gray-50 border border-gray-200 rounded-lg focus-within:border-[#1B75BC] focus-within:bg-white transition-all overflow-hidden text-sm">
                      <span className="flex items-center pl-4 pr-2 text-gray-500 font-medium bg-gray-100 border-r border-gray-200 whitespace-nowrap">
                        Barangay
                      </span>
                      <input 
                        required
                        type="text" 
                        placeholder="123"
                        className="w-full px-3 py-2 bg-transparent focus:outline-none"
                        value={formData.office_name.replace(/^Barangay\s*/i, '')}
                        onChange={e => {
                          const val = e.target.value;
                          setFormData({
                            ...formData, 
                            office_name: 'Barangay ' + val,
                            office_reference_no: 'MLA-BRGY-' + val.toUpperCase().replace(/\s+/g, '')
                          });
                        }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Reference ID <span className="text-red-500">*</span></label>
                    <div className="flex bg-gray-50 border border-gray-200 rounded-lg focus-within:border-[#1B75BC] focus-within:bg-white transition-all overflow-hidden text-sm">
                      <span className="flex items-center pl-4 pr-2 text-gray-500 font-medium bg-gray-100 border-r border-gray-200 whitespace-nowrap">
                        MLA-BRGY-
                      </span>
                      <input 
                        required
                        type="text" 
                        placeholder="123"
                        className="w-full px-3 py-2 bg-transparent focus:outline-none"
                        value={formData.office_reference_no.replace(/^(MLA-)?BRGY-/i, '')}
                        onChange={e => setFormData({...formData, office_reference_no: 'MLA-BRGY-' + e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Zone</label>
                    <input 
                      type="text" 
                      autoComplete="off"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1B75BC] focus:bg-white transition-all text-sm"
                      value={formData.zone}
                      onChange={e => setFormData({...formData, zone: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                    <input 
                      required
                      type="email" 
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1B75BC] focus:bg-white transition-all text-sm"
                      value={formData.email}
                      onChange={e => {
                        setFormData({...formData, email: e.target.value});
                        if (editFormError) setEditFormError('');
                      }}
                    />
                    {editFormError && <p className="text-xs text-red-500 mt-2 font-medium">{editFormError}</p>}
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                  <button 
                    type="button"
                    onClick={() => { setIsEditModalOpen(false); setEditStep('form'); }}
                    className="px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 text-sm font-semibold text-white bg-[#050A30] hover:bg-[#0a1545] rounded-lg transition-colors flex items-center justify-center min-w-[140px]"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6 overflow-y-auto">
                <div className="space-y-4 mb-8">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Barangay Name</p>
                    <p className="font-medium text-gray-900">{formData.office_name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Reference ID</p>
                    <p className="font-medium text-gray-900">{formData.office_reference_no}</p>
                  </div>
                  {formData.zone && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Zone</p>
                      <p className="font-medium text-gray-900">{formData.zone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email Address</p>
                    <p className="font-medium text-gray-900">{formData.email}</p>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                  <button 
                    type="button"
                    onClick={() => setEditStep('form')}
                    className="px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Back to Edit
                  </button>
                  <button 
                    onClick={handleConfirmEdit}
                    disabled={isSubmitting}
                    className="px-5 py-2 text-sm font-semibold text-white bg-[#050A30] hover:bg-[#0a1545] rounded-lg transition-colors disabled:opacity-70 flex items-center justify-center min-w-[140px]"
                  >
                    {isSubmitting ? <div className="spinner-light scale-75" /> : 'Done'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Archive Password Modal */}
      <ConfirmPasswordModal 
        open={isArchiveModalOpen}
        onCancel={() => setIsArchiveModalOpen(false)}
        onConfirm={handleArchive}
      />

      {/* Validation Error Modal */}
      <Modal open={errorModalOpen} onClose={() => setErrorModalOpen(false)} title="Validation Error" size="sm">
        <div className="text-center pb-2">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <X size={24} />
          </div>
          <h3 className="text-lg font-heading font-bold text-gray-900 mb-2">Wait a moment</h3>
          <p className="text-sm text-gray-600">{errorMessage}</p>
        </div>
        <div className="mt-6 flex justify-center">
          <button 
            onClick={() => setErrorModalOpen(false)}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors w-full"
          >
            Got it
          </button>
        </div>
      </Modal>

      {/* Final Archive Confirmation Modal */}
      {isArchiveConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col p-6">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4 mx-auto">
              <Archive size={24} />
            </div>
            <h2 className="text-xl font-heading font-bold text-gray-900 text-center mb-2">Are you sure?</h2>
            <p className="text-sm text-gray-500 text-center mb-8">
              Do you really want to archive this account? This action cannot be undone.
            </p>
            <div className="flex gap-3 mt-2">
              <button 
                onClick={() => setIsArchiveConfirmModalOpen(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleFinalArchive}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Archiving...' : 'Yes, Archive'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archived Details Modal */}
      {isArchivedDetailsModalOpen && selectedArchivedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                  <Archive size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-heading font-bold text-gray-900">Archived Account</h2>
                  <p className="text-xs text-gray-500">This account is currently inactive.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsArchivedDetailsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4 mb-8">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Barangay Name</p>
                  <p className="font-medium text-gray-900">{selectedArchivedAccount.office_name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Reference ID</p>
                  <p className="font-medium text-gray-900">{selectedArchivedAccount.office_reference_no}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email Address</p>
                  <p className="font-medium text-gray-900">{selectedArchivedAccount.registered_email}</p>
                </div>
                {selectedArchivedAccount.archived_at && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date Archived</p>
                    <p className="font-medium text-gray-900">{format(new Date(selectedArchivedAccount.archived_at), 'MMMM d, yyyy')}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsArchivedDetailsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={() => promptReactivate(selectedArchivedAccount.id)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-[#050A30] hover:bg-[#0a1545] rounded-lg transition-colors disabled:opacity-70 flex items-center justify-center"
                >
                  {isSubmitting ? 'Processing...' : 'Reactivate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Changes Modal */}
      {isNoChangesModalOpen && (
        <div className="fixed inset-0 bg-[#050A30]/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-fade-in flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h2 className="font-heading font-bold text-gray-900 text-lg">No Changes</h2>
              <button 
                onClick={() => setIsNoChangesModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-8">
                No changes were made to this account's details. Please modify at least one field to proceed.
              </p>
              
              <div className="flex justify-end">
                <button 
                  type="button"
                  onClick={() => setIsNoChangesModalOpen(false)}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-[#050A30] hover:bg-[#0a1545] rounded-lg transition-colors flex items-center justify-center"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reactivate Confirm Modal */}
      {isReactivateConfirmModalOpen && (
        <div className="fixed inset-0 bg-[#050A30]/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-fade-in flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h2 className="font-heading font-bold text-gray-900 text-lg">Confirm Reactivation</h2>
              <button 
                onClick={() => setIsReactivateConfirmModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-8">
                Are you sure you want to reactivate this account? This will restore their access to the system.
              </p>
              
              <div className="flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsReactivateConfirmModalOpen(false)}
                  className="px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmReactivate}
                  disabled={isSubmitting}
                  className="px-6 py-2 text-sm font-semibold text-white bg-[#050A30] hover:bg-[#0a1545] rounded-lg transition-colors flex items-center justify-center min-w-[100px]"
                >
                  {isSubmitting ? <div className="spinner-light scale-75" /> : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
