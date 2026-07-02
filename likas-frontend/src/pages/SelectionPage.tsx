import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/ui/PageHeader';
import DropdownSelect from '../components/ui/DropdownSelect';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import { geoService } from '../services';
import type { District, City, Barangay } from '../types';

interface SelectionPageProps {
  mode: 'flood' | 'street';
}

export default function SelectionPage({ mode }: SelectionPageProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const [districts, setDistricts] = useState<District[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);

  const [districtId, setDistrictId] = useState('');
  const [cityId, setCityId] = useState('');
  const [barangayId, setBarangayId] = useState('');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    geoService.getDistricts().then(setDistricts);
  }, []);

  const handleDistrictChange = async (id: string) => {
    setDistrictId(id); setCityId(''); setBarangayId(''); setCities([]); setBarangays([]);
    if (id) {
      setFetching(true);
      const cs = await geoService.getCitiesByDistrict(id);
      setCities(cs);
      setFetching(false);
    }
  };

  const handleCityChange = async (id: string) => {
    setCityId(id); setBarangayId(''); setBarangays([]);
    if (id) {
      setFetching(true);
      const bs = await geoService.getBarangaysByCity(id);
      setBarangays(bs);
      setFetching(false);
    }
  };

  const handleBarangayChange = async (id: string) => {
    setBarangayId(id);
    if (id) {
      setLoading(true);
      await new Promise(r => setTimeout(r, 1200)); // Simulate fetch
      setLoading(false);
      const path = mode === 'flood' ? '/flood-records' : '/street-registry';
      navigate(`${path}/${id}`);
    }
  };

  const title = mode === 'flood' ? 'FLOOD RECORDS' : 'STREET REGISTRY';

  return (
    <AppShell defaultExpanded={false}>
      <div className="relative min-h-full p-10">
        <LoadingOverlay visible={loading} message="Loading records..." />

        <PageHeader
          title={title}
          titleUppercase
          search={{ value: search, onChange: setSearch, placeholder: 'Search' }}
        />

        <div className="max-w-2xl space-y-4">
          {/* District card */}
          <SelectionCard label="Select District">
            <DropdownSelect
              options={districts.map(d => ({ value: d.id, label: d.name }))}
              value={districtId}
              onChange={handleDistrictChange}
              placeholder="Choose a district to continue"
              disabled={fetching && !districtId}
              className="max-w-sm"
            />
          </SelectionCard>

          {/* City card */}
          {districtId && (
            <SelectionCard label="Select City">
              <DropdownSelect
                options={cities.map(c => ({ value: c.id, label: c.name }))}
                value={cityId}
                onChange={handleCityChange}
                placeholder="Choose a city to continue"
                className="max-w-sm"
              />
            </SelectionCard>
          )}

          {/* Barangay card */}
          {cityId && (
            <SelectionCard label="Select Barangay">
              <DropdownSelect
                options={barangays.map(b => ({ value: b.id, label: b.name }))}
                value={barangayId}
                onChange={handleBarangayChange}
                placeholder="Choose a barangay to continue"
                className="max-w-sm"
              />
            </SelectionCard>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function SelectionCard({ label, children }: {
  label: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="font-heading font-bold text-gray-900 text-base mb-3">{label}</h2>
      {children}
    </div>
  );
}
