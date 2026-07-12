import { useEffect, useState } from 'react';
import { History, AlertTriangle } from 'lucide-react';
import Modal from '../ui/Modal';
import DataTable from '../ui/DataTable';
import PriorityBadge from '../ui/PriorityBadge';
import { floodService } from '../../services';
import type { PriorityItem, FloodIncident } from '../../types';

interface StreetHistoryModalProps {
  open: boolean;
  onClose: () => void;
  item: PriorityItem | null;
}

export default function StreetHistoryModal({ open, onClose, item }: StreetHistoryModalProps) {
  const [records, setRecords] = useState<FloodIncident[]>([]);
  const [loading, setLoading] = useState(false);

useEffect(() => {
  if (!open || !item) return;

  const currentItem = item;

  floodService.getFloodRecordsByBarangay(currentItem.barangayId || "")
    .then(data => {
      const streetRecords = data.filter(
        r => r.street.toLowerCase().includes(currentItem.streetName.toLowerCase()) ||
             currentItem.streetName.toLowerCase().includes(r.street.toLowerCase())
      );
      streetRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecords(streetRecords);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, [open, item]);

  if (!item) return null;

  const columns = [
    { key: 'date', header: 'Date', render: (r: FloodIncident) => <span className="font-medium text-gray-800">{r.date}</span> },
    { key: 'depth', header: 'Depth (in)', render: (r: FloodIncident) => r.depthInches },
    { key: 'cause', header: 'Cause', render: (r: FloodIncident) => <span className="text-xs text-gray-600">{r.cause}</span> },
    { key: 'priority', header: 'Priority', render: (r: FloodIncident) => <PriorityBadge priority={r.priority} size="sm" /> },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${item.streetName} Details`}
      size="md"
      headerRight={<PriorityBadge priority={item.priority} size="sm" />}
    >
      <div className="space-y-5">
        <div className="bg-[#F0F4F7] p-4 rounded-xl border border-gray-200">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs font-inter font-medium text-gray-500 uppercase tracking-wide">Location</p>
              <p className="font-heading font-semibold text-gray-900 text-sm mt-0.5">{item.barangay}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-inter font-medium text-gray-500 uppercase tracking-wide">Priority Score</p>
              <p className="font-heading font-bold text-[#C62828] text-sm mt-0.5">{item.priorityScore}</p>
            </div>
          </div>
          <div className="flex justify-between items-start">
             <div>
              <p className="text-xs font-inter font-medium text-gray-500 uppercase tracking-wide">Total Incidents</p>
              <p className="font-heading font-semibold text-gray-900 text-sm mt-0.5">{Math.max(records.length, item.floodCount)}</p>
            </div>
             <div className="text-right">
              <p className="text-xs font-inter font-medium text-gray-500 uppercase tracking-wide">Vulnerability</p>
              <p className="font-heading font-semibold text-gray-900 text-sm mt-0.5">{item.vulnerabilityScore}</p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <History size={16} className="text-[#1B75BC]" />
            <h3 className="font-heading font-bold text-gray-900 text-sm">Flood History</h3>
          </div>
          
          <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="flex items-center justify-center p-8"><div className="spinner-dark" /></div>
            ) : records.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-gray-400">
                <AlertTriangle size={24} className="mb-2 text-gray-300" />
                <p className="text-xs font-inter">No recorded flood incidents for this specific street.</p>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto custom-scrollbar">
                <DataTable
                  columns={columns as any}
                  data={records}
                  keyExtractor={r => r.id}
                  loading={false}
                  pageSize={100} // Show all in scrollable modal
                />
              </div>
            )}
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-heading font-semibold text-sm rounded-xl transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </Modal>
  );
}
