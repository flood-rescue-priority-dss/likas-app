/**
 * Lightweight point-in-polygon helpers for testing a lat/lng against the
 * GeoJSON features stored in `data/boundaries.json`. No external deps
 * (turf, etc.) — just a standard ray-casting test, which is plenty
 * accurate for barangay/district-sized polygons.
 *
 * NOTE: GeoJSON coordinates are [lng, lat], not [lat, lng].
 */

type Ring = [number, number][];

function pointInRing(lng: number, lat: number, ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersects =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

/** rings[0] = outer boundary, rings[1..] = holes to subtract */
function pointInPolygonRings(lng: number, lat: number, rings: Ring[]): boolean {
  if (!rings.length) return false;
  if (!pointInRing(lng, lat, rings[0])) return false;
  for (let i = 1; i < rings.length; i++) {
    if (pointInRing(lng, lat, rings[i])) return false; // sits in a hole
  }
  return true;
}

/**
 * Test a lat/lng against a single GeoJSON Feature (Polygon or MultiPolygon),
 * as found in boundaries.json.
 */
export function pointInGeoJSONFeature(lat: number, lng: number, feature: any): boolean {
  const geom = feature?.geometry;
  if (!geom) return false;

  if (geom.type === 'Polygon') {
    return pointInPolygonRings(lng, lat, geom.coordinates as Ring[]);
  }
  if (geom.type === 'MultiPolygon') {
    return (geom.coordinates as Ring[][]).some(polygonRings =>
      pointInPolygonRings(lng, lat, polygonRings)
    );
  }
  return false;
}

/**
 * Check whether a point falls inside a *specific* named boundary
 * (e.g. a barangay). Returns false if the name isn't in the dataset.
 */
export function isPointInBoundary(
  lat: number,
  lng: number,
  boundaries: Record<string, any>,
  boundaryName?: string | null
): boolean {
  if (!boundaryName) return true; // nothing to check against -> don't flag it
  const feature = boundaries[boundaryName];
  if (!feature) return true; // unknown boundary name -> don't flag it
  return pointInGeoJSONFeature(lat, lng, feature);
}

/**
 * Find the *first* boundary (in dataset order) that contains this point.
 * boundaries.json lists barangays first, then wider city/district groupings,
 * so the first match is naturally the finest-grained one — exactly what you
 * want when finding "which barangay is the user hovering over".
 *
 * Pass `candidateNames` to restrict/re-order the search (e.g. only barangays).
 */
export function findContainingBoundary(
  lat: number,
  lng: number,
  boundaries: Record<string, any>,
  candidateNames?: string[]
): string | null {
  const names = candidateNames ?? Object.keys(boundaries);
  for (const name of names) {
    const feature = boundaries[name];
    if (feature && pointInGeoJSONFeature(lat, lng, feature)) return name;
  }
  return null;
}
