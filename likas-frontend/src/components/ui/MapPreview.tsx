import { useEffect, useRef, useState } from 'react';
import { findContainingBoundary } from '../../services/utils/geoBounds';

export interface DistrictOverlay {
  /** Must match a key in boundaries.json, e.g. "District 1" */
  name: string;
  /** CSS-compatible color string, e.g. "#3b82f6" */
  color: string;
}

interface MapPreviewProps {
  center?: [number, number];
  zoom?: number;
  markerPosition?: [number, number];
  markerLabel?: string;
  height?: string;
  className?: string;
  interactive?: boolean;
  /** Single boundary name to highlight (barangay, city, or district name) */
  highlightBoundary?: string;
  /** Array of district overlays to render with distinct fill colors */
  districtOverlays?: DistrictOverlay[];
  /** If true, shows a floating label with whatever boundary is under the cursor */
  showHoverBoundary?: boolean;
  /** Fires with the boundary name under the cursor (or null when off any boundary) */
  onHoverBoundary?: (name: string | null) => void;
}

export default function MapPreview({
  center = [14.5931, 120.9748],
  zoom = 15,
  markerPosition,
  markerLabel,
  height = '300px',
  className = '',
  interactive = true,
  highlightBoundary,
  districtOverlays,
  showHoverBoundary = false,
  onHoverBoundary,
}: MapPreviewProps) {
  const mapRef        = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef     = useRef<any>(null);
  const polygonRef    = useRef<any>(null);
  // Holds one Leaflet layer per district overlay so we can clean them up correctly
  const overlayLayersRef = useRef<any[]>([]);
  const [mapReady, setMapReady] = useState(false);

  // ── Hover-boundary detection ────────────────────────────────────────────
  const [hoveredBoundary, setHoveredBoundary] = useState<string | null>(null);
  const [hoverPoint, setHoverPoint] = useState<{ x: number; y: number } | null>(null);
  const boundariesDataRef = useRef<Record<string, any> | null>(null);
  const hoverThrottleRef = useRef<number>(0);

  // Primitive lat/lng values for effect deps below. `center`/`markerPosition`
  // are arrays re-created on every parent render (e.g. every hover tick), so
  // depending on the array *reference* would re-run setView()/fitBounds() on
  // every mousemove and fight the user's manual pan/drag. Depending on the
  // primitive numbers instead means the effect only reruns when the actual
  // position changes.
  const centerLat = center[0];
  const centerLng = center[1];
  const markerLat = markerPosition?.[0];
  const markerLng = markerPosition?.[1];

  // ── Initialise map (once) ────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    if (!mapRef.current) return;

    import('leaflet').then(L => {
      if (cancelled || !mapRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, {
        center,
        zoom,
        zoomControl:      interactive,
        scrollWheelZoom:  interactive,
        dragging:         interactive,
        doubleClickZoom:  interactive,
        touchZoom:        interactive,
        attributionControl: false,
        preferCanvas: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

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

      const pos = markerPosition ?? center;
      markerRef.current = L.marker(pos, { icon: redIcon }).addTo(map);
      if (markerLabel) markerRef.current.bindPopup(`<b>${markerLabel}</b>`).openPopup();

      mapInstanceRef.current = map;
      setMapReady(true);

      setTimeout(() => { mapInstanceRef.current?.invalidateSize(); }, 100);
    });

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
        setMapReady(false);
      }
    };
  }, []);

  // ── Update marker when position/label changes ─────────────────────────────
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    if (markerPosition) {
      if (!markerRef.current) {
        import('leaflet').then(L => {
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
          markerRef.current = L.marker(markerPosition, { icon: redIcon }).addTo(mapInstanceRef.current!);
          if (markerLabel) markerRef.current.bindPopup(`<b>${markerLabel}</b>`);
        });
      } else {
        markerRef.current.setLatLng(markerPosition);
        if (markerLabel) markerRef.current.bindPopup(`<b>${markerLabel}</b>`);
      }
      mapInstanceRef.current.setView(markerPosition, zoom, { animate: false });
    } else {
      if (markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      mapInstanceRef.current.setView(center, zoom, { animate: false });
    }
  }, [markerLat, markerLng, markerLabel, zoom, mapReady, centerLat, centerLng]);

  // ── Single boundary highlight (barangay / city / district name) ───────────
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !highlightBoundary) return;

    let cancelled = false;
    import('leaflet').then(L => {
      if (cancelled) return;

      const drawFallback = () => {
        if (polygonRef.current) mapInstanceRef.current.removeLayer(polygonRef.current);
        const lat = center[0], lng = center[1];
        const pts: [number, number][] = [];
        const seed = Math.abs(lat * 100000) % 1;
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const r = 0.002 + Math.sin((seed + i) * 10) * 0.0008;
          pts.push([lat + Math.cos(angle) * r, lng + Math.sin(angle) * r]);
        }
        polygonRef.current = L.polygon(pts, {
          color: '#ef4444', weight: 2, fillColor: '#ef4444', fillOpacity: 0.1
        }).addTo(mapInstanceRef.current);
        if (!markerPosition) mapInstanceRef.current.setView(center, zoom, { animate: false });
      };

      const drawPolygon = (geojson: any, fromNominatim = false) => {
        const tmp = L.geoJSON(geojson);
        if (fromNominatim) {
          const boundsCenter = tmp.getBounds().getCenter();
          const expected = L.latLng(center[0], center[1]);
          if (boundsCenter.distanceTo(expected) > 10000) { drawFallback(); return; }
        }
        if (polygonRef.current) mapInstanceRef.current.removeLayer(polygonRef.current);
        polygonRef.current = L.geoJSON(geojson, {
          style: { color: '#ef4444', weight: 2, fillColor: '#ef4444', fillOpacity: 0.1 }
        }).addTo(mapInstanceRef.current);
        if (!markerPosition) mapInstanceRef.current.fitBounds(polygonRef.current.getBounds(), { animate: false });
      };

      import('../../data/boundaries.json').then(mod => {
        if (cancelled) return;
        const boundaries = mod.default as Record<string, any>;
        if (boundaries[highlightBoundary]) { drawPolygon(boundaries[highlightBoundary]); return; }

        // Nominatim fallback
        let q = highlightBoundary;
        if (q.includes('Tondo'))    q = 'Tondo';
        if (q.includes('District')) q = 'Manila';
        const query = encodeURIComponent(q === 'Manila' || q === 'All Barangays' ? 'City of Manila, Philippines' : `${q}, Manila`);
        fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&polygon_geojson=1`, {
          headers: { 'User-Agent': 'likas-app' },
        })
          .then(r => r.json())
          .then(data => { if (!cancelled && data?.[0]?.geojson) drawPolygon(data[0].geojson, true); else drawFallback(); })
          .catch(() => drawFallback());
      }).catch(() => drawFallback());
    });

    return () => { cancelled = true; };
  }, [highlightBoundary, markerLat, markerLng, mapReady]);

  // ── District overlay layers (color-coded, one layer per district) ─────────
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    let cancelled = false;

    // Remove any previously drawn overlay layers first
    overlayLayersRef.current.forEach(layer => {
      mapInstanceRef.current?.removeLayer(layer);
    });
    overlayLayersRef.current = [];

    if (!districtOverlays?.length) return;

    import('leaflet').then(L => {
      if (cancelled) return;
      import('../../data/boundaries.json').then(mod => {
        if (cancelled) return;
        const boundaries = mod.default as Record<string, any>;

        districtOverlays.forEach(({ name, color }) => {
          if (!boundaries[name]) return;
          const layer = L.geoJSON(boundaries[name], {
            style: {
              color,
              weight: 2,
              fillColor: color,
              fillOpacity: 0.15,
            },
          }).addTo(mapInstanceRef.current!);

          // Tooltip on hover showing the district name
          layer.bindTooltip(name, { sticky: true, className: 'leaflet-district-tooltip' });

          overlayLayersRef.current.push(layer);
        });
      });
    });

    return () => { cancelled = true; };
  }, [mapReady, districtOverlays]);

  // ── Hover detection: show which boundary the cursor is currently over ─────
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !(showHoverBoundary || onHoverBoundary)) return;

    let cancelled = false;
    let handler: ((e: any) => void) | null = null;
    let leaveHandler: (() => void) | null = null;
    const map = mapInstanceRef.current;

    // Boundaries only need to be fetched once and reused across hover events.
    const boundariesPromise = boundariesDataRef.current
      ? Promise.resolve(boundariesDataRef.current)
      : import('../../data/boundaries.json').then(mod => {
          boundariesDataRef.current = mod.default as Record<string, any>;
          return boundariesDataRef.current;
        });

    boundariesPromise.then(boundaries => {
      if (cancelled) return;

      handler = (e: any) => {
        // Throttle to ~10 checks/sec — plenty smooth, avoids testing ~900 polygons every pixel of movement
        const now = Date.now();
        if (now - hoverThrottleRef.current < 100) return;
        hoverThrottleRef.current = now;

        const { lat, lng } = e.latlng;
        const name = findContainingBoundary(lat, lng, boundaries);

        setHoveredBoundary(prev => (prev === name ? prev : name));
        setHoverPoint({ x: e.containerPoint.x, y: e.containerPoint.y });
        onHoverBoundary?.(name);
      };

      leaveHandler = () => {
        setHoveredBoundary(null);
        setHoverPoint(null);
        onHoverBoundary?.(null);
      };

      map.on('mousemove', handler);
      map.on('mouseout', leaveHandler);
    });

    return () => {
      cancelled = true;
      if (handler) map.off('mousemove', handler);
      if (leaveHandler) map.off('mouseout', leaveHandler);
    };
  }, [mapReady, showHoverBoundary, onHoverBoundary]);

  return (
    <div className={`relative w-full ${className}`} style={{ height }}>
      <div
        ref={mapRef}
        className="rounded-2xl overflow-hidden border border-gray-100 h-full"
        style={{ isolation: 'isolate' }}
      />
      {showHoverBoundary && hoveredBoundary && hoverPoint && (
        <div
          className="pointer-events-none absolute z-[1000] px-2 py-1 rounded-md bg-gray-900/85 text-white text-xs font-inter shadow-lg whitespace-nowrap"
          style={{
            left: hoverPoint.x + 12,
            top: hoverPoint.y + 12,
          }}
        >
          {hoveredBoundary}
        </div>
      )}
    </div>
  );
}
