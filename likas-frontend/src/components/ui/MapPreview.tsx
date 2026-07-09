import { useEffect, useRef } from 'react';

interface MapPreviewProps {
  center?: [number, number];
  zoom?: number;
  markerPosition?: [number, number];
  markerLabel?: string;
  height?: string;
  className?: string;
  interactive?: boolean;
}

export default function MapPreview({
  center = [14.5931, 120.9748],
  zoom = 15,
  markerPosition,
  markerLabel,
  height = '300px',
  className = '',
  interactive = true,
}: MapPreviewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    // Guard against StrictMode double-init
    let cancelled = false;

    if (!mapRef.current) return;

    // Dynamic import to avoid SSR issues
    import('leaflet').then(L => {
      if (cancelled || !mapRef.current) return;

      // If already initialized (HMR/StrictMode), clean up first
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }

      // Fix default marker icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, {
        center: center,
        zoom: zoom,
        zoomControl: interactive,
        scrollWheelZoom: interactive,
        dragging: interactive,
        doubleClickZoom: interactive,
        touchZoom: interactive,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      // Red marker icon
      const redIcon = L.divIcon({
        html: `<div style="
          width: 24px; height: 24px;
          background: #C62828;
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 8px rgba(198,40,40,0.5);
        "></div>`,
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 24],
      });

      const pos = markerPosition ?? center;
      markerRef.current = L.marker(pos, { icon: redIcon }).addTo(map);
      if (markerLabel) {
        markerRef.current.bindPopup(`<b>${markerLabel}</b>`).openPopup();
      }

      mapInstanceRef.current = map;
      
      // Force Leaflet to recalculate container size after DOM paint
      // This fixes the blank gray box issue inside flex/dynamic layouts
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 100);
    });

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Update marker when position changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markerPosition) return;
    if (markerRef.current) {
      markerRef.current.setLatLng(markerPosition);
      mapInstanceRef.current.setView(markerPosition, zoom);
      if (markerLabel) markerRef.current.setPopupContent(`<b>${markerLabel}</b>`);
    }
  }, [markerPosition, markerLabel]);

  return (
    <div
      ref={mapRef}
      className={`rounded-2xl overflow-hidden border border-gray-100 ${className}`}
      style={{ height, isolation: 'isolate' }}
    />
  );
}
