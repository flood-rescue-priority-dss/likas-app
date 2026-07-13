import { useState, useEffect } from 'react';
import { Calendar, Clock, AlertTriangle, MapPin } from 'lucide-react';
import Modal from '../ui/Modal';
import DropdownSelect from '../ui/DropdownSelect';
import InfoTooltip from '../ui/InfoTooltip';
import { floodService, geoService } from '../../services';
import type { FloodIncident, FloodCause, FloodStatus, Priority, Barangay } from '../../types';
import { MapContainer, TileLayer, Marker, useMapEvents, GeoJSON, Tooltip } from 'react-leaflet';
import boundariesData from '../../data/boundaries.json';
import L from 'leaflet';

// Fix leaflet icon issue in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const redIcon = L.divIcon({
  html: `<div style="
    width:24px;height:24px;
    background:#C62828;border:3px solid white;
    border-radius:50% 50% 50% 0;transform:rotate(-45deg);
    box-shadow:0 2px 8px rgba(198,40,40,.5);
  "></div>`,
  className: '',
  iconSize:   [24, 24],
  iconAnchor: [12, 24],
});

const STREETS = ['Padre Faura Taft South Bound', 'NBI Taft', 'Quirino Ave.', 'Taft Avenue', 'Pedro Gil', 'United Nations Avenue'];
const CAUSES: FloodCause[] = ['Heavy Rainfall', 'Tropical Cyclone'];

const calcPriority = (depth: number): Priority => {
  if (depth < 10) return 'Low';
  if (depth < 20) return 'Medium';
  return 'High';
};

const calcStatus = (depth: number): FloodStatus => {
  if (depth >= 20) return 'NPATV';
  if (depth >= 9) return 'NPLV';
  return 'PATV';
};

interface LogIncidentModalProps {
  open: boolean;
  onClose: () => void;
  barangayId: string;
  onSaved: (incident: FloodIncident) => void;
}

// Component to handle map clicks
function LocationPicker({ position, setPosition }: { position: L.LatLng | null, setPosition: (p: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return position ? (
    <Marker position={position} icon={redIcon}>
      <Tooltip permanent direction="top" offset={[0, -24]}>Pinned Location</Tooltip>
    </Marker>
  ) : null;
}

export default function LogIncidentModal({ open, onClose, barangayId, onSaved }: LogIncidentModalProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [street, setStreet] = useState('');
  const MIN_FLOOD_DEPTH = 8;
  const [depth, setDepth] = useState(MIN_FLOOD_DEPTH);
  const [cause, setCause] = useState<FloodCause | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOverridePrompt, setShowOverridePrompt] = useState(false);
  
  // New State for Map Step
  const [step, setStep] = useState<'map' | 'form' | 'overview'>('map');
  const [barangay, setBarangay] = useState<Barangay | null>(null);
  const [barangayLoading, setBarangayLoading] = useState(false);
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [resolvedLocationName, setResolvedLocationName] = useState<string>('');

  useEffect(() => {
    if (!position) {
      setResolvedLocationName('');
      return;
    }
    let active = true;
    setResolvedLocationName('Fetching...');
    
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`)
      .then(res => res.json())
      .then(data => {
        if (!active) return;
        const resolvedStreet = data?.address?.road || data?.address?.neighbourhood || data?.address?.suburb;
        if (resolvedStreet) {
          setResolvedLocationName(resolvedStreet);
        }
      })
      .catch(e => {
        console.error('Failed to reverse geocode:', e);
      });
    return () => { active = false; };
  }, [position, barangay]);

  useEffect(() => {
    if (open && barangayId && barangayId !== 'ALL') {
      setBarangayLoading(true);
      geoService.getBarangayById(barangayId).then(b => {
        if (b) setBarangay(b);
      }).catch(console.error).finally(() => setBarangayLoading(false));
    }
  }, [open, barangayId]);

  const handleProceedToForm = () => {
    if (!position) {
      setError('Please pin a location on the map first.');
      return;
    }
    setError('');
    const isFallback = resolvedLocationName === 'Fetching...';
    setStreet(isFallback ? '' : resolvedLocationName);
    setStep('form');
  };

  const handleProceedToOverview = () => {
    if (!date || !time || !street || depth < MIN_FLOOD_DEPTH || !cause) {
      setError('Please fill in all required fields. Flood depth must be at least ${MIN_FLOOD_DEPTH} inches.');
      return;
    }
    setError('');
    setStep('overview');
  };

  const handleSave = async (forceOverride = false) => {
    if (!date || !time || !street || depth < MIN_FLOOD_DEPTH || !cause) {
      setError('Please fill in all required fields. Flood depth must be at least ${MIN_FLOOD_DEPTH} inches.');
      return;
    }
    setLoading(true); setError('');
    try {
      const incident = await floodService.createFloodIncident({
        barangayId,
        date,
        time,
        street,
        depthInches: depth,
        status: calcStatus(depth),
        cause: cause as FloodCause,
        priority: calcPriority(depth),
      }, forceOverride);
      onSaved(incident);
      resetForm();
      onClose();
    } catch (e: any) {
      if (e.message === 'DuplicateRecord') {
        setShowOverridePrompt(true);
      } else {
        setError(e.message || 'Failed to save incident.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDate(''); setTime(''); setStreet(''); setDepth(MIN_FLOOD_DEPTH); setCause('');
    setPosition(null); setBarangay(null);
    setError(''); setShowOverridePrompt(false); setStep('map');
  };

  const handleClose = () => { resetForm(); onClose(); };

  // Default to Manila center if barangay not found
  const mapCenter: [number, number] = barangay && barangay.lat && barangay.lng 
    ? [barangay.lat, barangay.lng] 
    : [14.5995, 120.9842];

  const getBoundaryFeature = (bName: string) => {
    const data = boundariesData as Record<string, any>;
    if (data[bName]) return data[bName];
    const key = Object.keys(data).find(k => k.toLowerCase() === bName.toLowerCase());
    return key ? data[key] : null;
  };
  const geojsonFeature = barangay ? getBoundaryFeature(barangay.name) : null;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Incident Log"
      size={step === 'map' ? 'lg' : 'md'}
      headerRight={<InfoTooltip />}
    >
      <div className="space-y-4">
        {step === 'map' ? (
          <>
            <div className="text-sm font-inter text-gray-600 mb-2">
              <p>Pin the exact location of the flood incident on the map.</p>
              {barangay && <p className="font-semibold text-gray-800 mt-1">Zoomed to {barangay.name}</p>}
            </div>
            
            <div className="relative h-[400px] rounded-xl overflow-hidden border border-gray-200">
              {barangayLoading ? (
                <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-xl flex items-center justify-center">
                  <span className="text-xs font-inter text-gray-400">Loading map…</span>
                </div>
              ) : open && (
                <MapContainer
                  key={barangay?.id ?? 'default'}
                  center={mapCenter}
                  zoom={16}
                  scrollWheelZoom={true}
                  className="w-full h-full z-0"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {geojsonFeature && (
                    <GeoJSON
                      key={barangay?.name}
                      data={geojsonFeature}
                      style={{ color: '#EF4444', weight: 2.5, fillColor: '#EF4444', fillOpacity: 0.08 }}
                    />
                  )}
                  <LocationPicker position={position} setPosition={setPosition} />
                </MapContainer>
              )}

              {/* Location Overlay */}
              {position && (
                <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-lg p-3 z-[400] flex items-center gap-3">
                  <div className="pl-2 pr-1 flex-shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#050A30" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 0C7.58 0 4 3.58 4 8C4 14 12 24 12 24C12 24 20 14 20 8C20 3.58 16.42 0 12 0ZM12 11.5C10.07 11.5 8.5 9.93 8.5 8C8.5 6.07 10.07 4.5 12 4.5C13.93 4.5 15.5 6.07 15.5 8C15.5 9.93 13.93 11.5 12 11.5Z"/>
                    </svg>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Selected Location</p>
                    <p className="font-bold text-[#050A30] text-[17px] truncate">{resolvedLocationName}</p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <p className="text-xs text-[#C62828] font-inter mt-2">{error}</p>
            )}

            <div className="border-t border-gray-100 pt-4 flex gap-3 mt-2">
              <button
                onClick={handleClose}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-heading font-semibold text-sm rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleProceedToForm}
                disabled={mapLoading || !position}
                className="flex-1 py-3 bg-[#050A30] hover:bg-[#0a1545] disabled:opacity-60 text-white font-heading font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {mapLoading ? 'Locating...' : 'Next'}
              </button>
            </div>
          </>
        ) : step === 'form' ? (
          <>
            {/* Date */}
            <div>
              <label className="block text-xs font-inter font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Date <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-4 py-3 pr-4 border border-gray-200 rounded-xl text-sm font-inter bg-white focus:outline-none focus:ring-2 focus:ring-[#1B75BC]/30 focus:border-[#1B75BC]"
                />
              </div>
            </div>

            {/* Time */}
            <div>
              <label className="block text-xs font-inter font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Time <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="time"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="w-full px-4 py-3 pr-4 border border-gray-200 rounded-xl text-sm font-inter bg-white focus:outline-none focus:ring-2 focus:ring-[#1B75BC]/30 focus:border-[#1B75BC]"
                />
              </div>
            </div>

            {/* Street */}
            <div>
              <label className="block text-xs font-inter font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Street <span className="text-red-500">*</span></label>
              <div className="relative flex items-center">
                <MapPin className="absolute left-4 text-[#1B75BC]" size={18} />
                <input
                  type="text"
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                  placeholder="Street Name"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm font-inter bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1B75BC]/30 focus:border-[#1B75BC]"
                />
              </div>
              <p className="text-xs font-inter mt-1 text-gray-400">
                Resolved from pinned location. You can edit if needed.
              </p>
            </div>

            {/* Flood Depth */}
            <div>
              <label className="block text-xs font-inter font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Flood Depth <span className="text-red-500">*</span></label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={MIN_FLOOD_DEPTH}
                  step={1}
                  value={depth}
                  onChange={(e) => {
                    const value = Number(e.target.value);

                    if (Number.isNaN(value)) return;

                    setDepth(Math.max(MIN_FLOOD_DEPTH, value));
                  }}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-inter bg-white focus:outline-none focus:ring-2 focus:ring-[#1B75BC]/30 focus:border-[#1B75BC]"
                />
                <span className="px-4 py-3 bg-[#F0F4F7] border border-gray-200 rounded-xl text-sm font-inter text-gray-600 font-medium">in</span>
              </div>

              <p className="text-xs font-inter mt-1 text-gray-400">
                Flood depth defaults to <strong>8 inches</strong> and cannot be lower.
              </p>

              {depth > 0 && (
                <p className="text-xs font-inter mt-1 text-gray-400">
                  Estimated priority: <span className={`font-semibold ${
                    calcPriority(depth) === 'Low' ? 'text-emerald-600' :
                    calcPriority(depth) === 'Medium' ? 'text-amber-600' :
                    'text-red-600'
                  }`}>{calcPriority(depth)}</span>
                </p>
              )}
            </div>

            {/* Cause */}
            <div>
              <label className="block text-xs font-inter font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Cause <span className="text-red-500">*</span></label>
              <DropdownSelect
                options={CAUSES.map(c => ({ value: c, label: c }))}
                value={cause}
                onChange={v => setCause(v as FloodCause)}
                placeholder="Type or select a cause"
              />
            </div>

            {error && (
              <p className="text-xs text-[#C62828] font-inter">{error}</p>
            )}

            <div className="border-t border-gray-100 pt-4 flex gap-3 mt-2">
              <button
                onClick={() => { setStep('map'); setError(''); }}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-heading font-semibold text-sm rounded-xl transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleProceedToOverview}
                className="flex-1 py-3 bg-[#050A30] hover:bg-[#0a1545] text-white font-heading font-semibold text-sm rounded-xl transition-colors"
              >
                Review Details
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4 mb-8 mt-2">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date & Time</p>
                <p className="font-medium text-gray-900">{date} at {time}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Street</p>
                <p className="font-medium text-gray-900">{street}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Flood Depth</p>
                <p className="font-medium text-gray-900">{depth} inches</p>
                <p className="text-xs font-inter mt-1 text-gray-400">
                  Estimated priority: <span className={`font-semibold ${
                    calcPriority(depth) === 'Low' ? 'text-emerald-600' :
                    calcPriority(depth) === 'Medium' ? 'text-amber-600' :
                    'text-red-600'
                  }`}>{calcPriority(depth)}</span>
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Cause</p>
                <p className="font-medium text-gray-900">{cause}</p>
              </div>
            </div>

            {error && !showOverridePrompt && (
              <p className="text-xs text-[#C62828] font-inter">{error}</p>
            )}

            {/* Footer */}
            {showOverridePrompt ? (
              <div className="border-t border-gray-100 pt-4 mt-2">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 flex items-start gap-2">
                  <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs font-inter text-amber-800 font-medium">Do you wish to still add? There is existing data.</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowOverridePrompt(false)}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-heading font-semibold text-sm rounded-xl transition-colors"
                  >
                    No, cancel
                  </button>
                  <button
                    onClick={() => handleSave(true)}
                    disabled={loading}
                    className="flex-1 py-3 bg-[#050A30] hover:bg-[#0a1545] disabled:opacity-60 text-white font-heading font-semibold text-sm rounded-xl transition-colors"
                  >
                    {loading ? 'Saving...' : 'Yes, add anyway'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-100 pt-4 flex gap-3 mt-2">
                <button
                  onClick={() => { setStep('form'); setError(''); }}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-heading font-semibold text-sm rounded-xl transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => handleSave(false)}
                  disabled={loading}
                  className="flex-1 py-3 bg-[#050A30] hover:bg-[#0a1545] disabled:opacity-60 text-white font-heading font-semibold text-sm rounded-xl transition-colors"
                >
                  {loading ? 'Saving...' : 'Confirm'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
