import { useEffect, useRef, useState } from 'react';

interface MapPreviewProps {
  center?: [number, number];
  zoom?: number;
  markerPosition?: [number, number];
  markerLabel?: string;
  height?: string;
  className?: string;
  interactive?: boolean;
  highlightBoundary?: string;
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
}: MapPreviewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const polygonRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);

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
        preferCanvas: true, // Crucial for rendering highly complex polygons like the whole City of Manila without lag
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
      setMapReady(true);
      
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
        setMapReady(false);
      }
    };
  }, []);

  // Update marker when position changes
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    if (markerRef.current) {
      if (markerPosition) {
        markerRef.current.setLatLng(markerPosition);
        mapInstanceRef.current.setView(markerPosition, zoom, { animate: false });
      }
      if (markerLabel) {
        markerRef.current.setPopupContent(`<b>${markerLabel}</b>`);
      }
    }
  }, [markerPosition, markerLabel, zoom, mapReady]);

  // Update boundary when highlightBoundary changes
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !highlightBoundary) return;
    
    let cancelled = false;
    import('leaflet').then(L => {
      if (cancelled) return;

      const drawFallbackPolygon = () => {
        if (polygonRef.current) {
          mapInstanceRef.current.removeLayer(polygonRef.current);
        }
        
        const lat = center[0];
        const lng = center[1];
        const points: [number, number][] = [];
        const numPoints = 8;
        // Consistent seed based on coordinates
        const seed = Math.abs(lat * 100000) % 1;
        
        for (let i = 0; i < numPoints; i++) {
          const angle = (i / numPoints) * Math.PI * 2;
          const variance = Math.sin((seed + i) * 10) * 0.0008;
          const radius = 0.002 + variance; // approx 200m - 300m
          points.push([
            lat + Math.cos(angle) * radius,
            lng + Math.sin(angle) * radius
          ]);
        }

        polygonRef.current = L.polygon(points, {
          color: '#ef4444',
          weight: 2,
          fillColor: '#ef4444',
          fillOpacity: 0.1
        }).addTo(mapInstanceRef.current);

        if (!markerPosition) {
          if (markerRef.current) {
            markerRef.current.setLatLng(center);
          }
          mapInstanceRef.current.fitBounds(polygonRef.current.getBounds(), { animate: false });
        }
      };

      const drawPolygon = (geojson: any) => {
        let tempLayer = L.geoJSON(geojson);
        const boundsCenter = tempLayer.getBounds().getCenter();
        const expectedCenter = L.latLng(center[0], center[1]);
        
        // If the polygon is more than 3km away from our expected center, it's junk data from Nominatim!
        if (boundsCenter.distanceTo(expectedCenter) > 3000) {
          drawFallbackPolygon();
          return;
        }

        if (polygonRef.current) {
          mapInstanceRef.current.removeLayer(polygonRef.current);
        }
        
        polygonRef.current = L.geoJSON(geojson, {
          style: { color: '#ef4444', weight: 2, fillColor: '#ef4444', fillOpacity: 0.1 }
        }).addTo(mapInstanceRef.current);
        
        if (!markerPosition) {
          if (markerRef.current) {
            markerRef.current.setLatLng(boundsCenter);
          }
          mapInstanceRef.current.fitBounds(polygonRef.current.getBounds(), { animate: false });
        }
      };

      // Dynamic import to prevent main bundle bloat
      import('../../data/boundaries.json').then((mod) => {
        const boundaries = mod.default as Record<string, any>;
        if (boundaries[highlightBoundary]) {
          drawPolygon(boundaries[highlightBoundary]);
          return;
        }

        // Fallback to Nominatim API if not in local cache (should be rare now)
        const query = encodeURIComponent(`${highlightBoundary}, Manila`);
        fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&polygon_geojson=1`, {
          headers: { 'User-Agent': 'likas-app' }
        })
        .then(res => res.json())
        .then(data => {
          if (cancelled) return;
          if (data && data.length > 0 && data[0].geojson) {
            drawPolygon(data[0].geojson);
          } else {
            drawFallbackPolygon();
          }
        })
        .catch(err => {
          console.error(err);
          drawFallbackPolygon();
        });
      }).catch(err => {
        console.error("Failed to load boundaries.json", err);
        drawFallbackPolygon();
      });
    });

    return () => {
      cancelled = true;
    };
  }, [highlightBoundary, markerPosition, mapReady]);

  return (
    <div
      ref={mapRef}
      className={`rounded-2xl overflow-hidden border border-gray-100 ${className}`}
      style={{ height, isolation: 'isolate' }}
    />
  );
}
