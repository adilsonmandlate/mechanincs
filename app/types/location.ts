/**
 * Location type for PostGIS geography(POINT)
 * Represents a geographic point with latitude and longitude
 */
export interface LocationPoint {
  latitude: number
  longitude: number
}

/**
 * Convert LocationPoint to PostGIS POINT format
 * @param point - Location point with latitude and longitude
 * @returns PostGIS POINT string format: 'POINT(longitude latitude)'
 */
export function toPostGISPoint(point: LocationPoint): string {
  return `POINT(${point.longitude} ${point.latitude})`
}

/**
 * Parse PostGIS POINT string to LocationPoint
 * @param pointString - PostGIS POINT string format: 'POINT(longitude latitude)'
 * @returns LocationPoint object
 */
export function fromPostGISPoint(pointString: string): LocationPoint {
  const match = pointString.match(/POINT\(([\d.]+)\s+([\d.]+)\)/)
  if (!match) {
    throw new Error('Invalid PostGIS POINT format')
  }
  return {
    longitude: Number.parseFloat(match[1]),
    latitude: Number.parseFloat(match[2]),
  }
}
