import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import MetricCard from '../components/ui/MetricCard';
import SearchInput from '../components/ui/SearchInput';
import PriorityBadge from '../components/ui/PriorityBadge';
import DataTable from '../components/ui/DataTable';
import type { Column } from '../components/ui/DataTable';
import { floodService } from '../services';
import type { FloodIncident } from '../types';

type TabType = 'pending' | 'approved' | 'rejected';

export default function IncidentLogManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [incidents, setIncidents] = useState<FloodIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [pendingCount, setPendingCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);

  useEffect(() => {
    loadCounts();
  }, []);

  useEffect(() => {
    loadIncidents();
  }, [activeTab]);

  const loadCounts = async () => {
    try {
      const [pending, approved, rejected] = await Promise.all([
        floodService.getFloodRecordsFiltered({ approvalStatus: 'Pending' }),
        floodService.getFloodRecordsFiltered({ approvalStatus: 'Approved' }),
        floodService.getFloodRecordsFiltered({ approvalStatus: 'Rejected' }),
      ]);
      setPendingCount(pending.length);
      setApprovedCount(approved.length);
      setRejectedCount(rejected.length);
    } catch (error) {
      console.error('Failed to load counts:', error);
    }
  };

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const statusMap: Record<TabType, string> = {
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
      };
      const data = await floodService.getFloodRecordsFiltered({ 
        approvalStatus: statusMap[activeTab] 
      });
      setIncidents(data);
    } catch (error) {
      console.error('Failed to load incidents:', error);
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (incidentId: string) => {
    setProcessingId(incidentId);
    try {
      await floodService.approveIncident(incidentId);
      setIncidents(prev => prev.filter(i => i.id !== incidentId));
      await loadCounts();
    } catch (error) {
      console.error('Failed to approve incident:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (incidentId: string) => {
    setProcessingId(incidentId);
    try {
      await floodService.rejectIncident(incidentId);
      setIncidents(prev => prev.filter(i => i.id !== incidentId));
      await loadCounts();
    } catch (error) {
      console.error('Failed to reject incident:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredIncidents = incidents.filter(incident =>
    incident.street.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (incident.barangayName?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusBadge = (status: string) => {
    const config = {
      Pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending' },
      Approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Approved' },
      Rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
    }[status] || { bg: 'bg-gray-100', text: 'text-gray-600', label: status };

    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-inter font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const columns: Column<FloodIncident>[] = [
    {
      key: 'street',
      header: 'Location',
      render: (incident) => (
        <div>
          <div className="text-sm font-semibold text-gray-800">{incident.street}</div>
          {incident.barangayName && (
            <div className="text-xs font-inter text-gray-400 mt-0.5">{incident.barangayName}</div>
          )}
        </div>
      )
    },
{
      key: 'barangayId',
      header: 'Submitted By',
      render: (incident) => {
        // Fallback cleanup just in case barangayName is missing
        const cleanId = incident.barangayId
          .replace(/^(bgy|brgy|barangay)-?/i, '')
          .replace(/^barangay-?/i, '');
          
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-inter font-semibold bg-slate-100 text-slate-600">
            {incident.barangayName || `Barangay ${cleanId}`}
          </span>
        );
      }
    },
    {
      key: 'date',
      header: 'Date',
      className: 'font-medium',
    },
    {
      key: 'time',
      header: 'Time',
      className: 'font-medium',
    },
    {
      key: 'depthInches',
      header: 'Depth (in)',
      className: 'text-gray-800 font-medium',
    },
    {
      key: 'cause',
      header: 'Cause',
      render: (incident) => (
        <span className="text-xs font-inter text-gray-600">{incident.cause}</span>
      )
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (incident) => (
        <PriorityBadge priority={incident.priority} size="sm" />
      )
    },
    {
      key: 'approvalStatus',
      header: 'Status',
      render: (incident) => getStatusBadge(incident.approvalStatus || 'Pending')
    }
  ];

  if (activeTab === 'pending') {
    columns.push({
      key: 'actions',
      header: 'Actions',
      render: (incident) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleReject(incident.id)}
            disabled={processingId === incident.id}
            className="px-3 py-1.5 text-xs font-heading font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <XCircle size={14} />
            Reject
          </button>
          <button
            onClick={() => handleApprove(incident.id)}
            disabled={processingId === incident.id}
            className="px-3 py-1.5 text-xs font-heading font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <CheckCircle size={14} />
            Approve
          </button>
        </div>
      )
    });
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10">
      <PageHeader
        title="INCIDENT LOG MANAGEMENT"
        titleUppercase
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard
          label="Pending Review"
          value={pendingCount}
          icon={<Clock size={14} className="text-amber-500" />}
          iconBg="bg-amber-50"
        />
        <MetricCard
          label="Approved"
          value={approvedCount}
          icon={<CheckCircle size={14} className="text-emerald-500" />}
          iconBg="bg-emerald-50"
        />
        <MetricCard
          label="Rejected"
          value={rejectedCount}
          icon={<XCircle size={14} className="text-red-500" />}
          iconBg="bg-red-50"
        />
      </div>

      {/* Tab Navigation & Content Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-6 pt-4">
          <div className="flex gap-6">
            {[
              { key: 'pending' as TabType, label: 'Pending Approvals', count: pendingCount },
              { key: 'approved' as TabType, label: 'Approved', count: approvedCount },
              { key: 'rejected' as TabType, label: 'Rejected', count: rejectedCount },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-3 px-2 text-sm font-heading font-semibold transition-colors relative ${
                  activeTab === tab.key
                    ? 'text-[#1B75BC]'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-inter font-bold ${
                    activeTab === tab.key ? 'bg-[#1B75BC] text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1B75BC]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-inter font-medium text-gray-500 uppercase">
              {activeTab === 'pending' && 'Incident logs waiting for admin verification'}
              {activeTab === 'approved' && 'Successfully approved incidents'}
              {activeTab === 'rejected' && 'Rejected incident logs'}
            </h3>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search streets..."
              className="w-64"
            />
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={filteredIncidents}
          keyExtractor={(inc) => inc.id}
          loading={loading}
          emptyMessage="No incident logs found."
        />
      </div>
    </div>
  );
}
