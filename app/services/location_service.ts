import db from '@adonisjs/lucid/services/db'

/**
 * Location Service
 *
 * Service for working with PostGIS geography data
 */
export class LocationService {
  /**
   * Convert latitude/longitude to PostGIS POINT format
   */
  toPostGISPoint(point: { latitude: number; longitude: number }): string {
    return `POINT(${point.longitude} ${point.latitude})`
  }

  /**
   * Calculate distance between two points in kilometers
   * Uses PostGIS ST_Distance function
   */
  async calculateDistance(
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number }
  ): Promise<number> {
    const result = await db.rawQuery(
      `
      SELECT ST_Distance(
        ST_GeogFromText('POINT(:lon1 :lat1)'),
        ST_GeogFromText('POINT(:lon2 :lat2)')
      ) / 1000 as distance_km
    `,
      {
        lat1: point1.latitude,
        lon1: point1.longitude,
        lat2: point2.latitude,
        lon2: point2.longitude,
      }
    )

    return Number.parseFloat(result.rows[0]?.distance_km || '0')
  }

  /**
   * Find points within a radius (in kilometers) from a center point
   * Returns SQL fragment for use in queries
   */
  getWithinRadiusQuery(
    centerPoint: { latitude: number; longitude: number },
    radiusKm: number,
    locationColumn: string = 'location'
  ): string {
    const point = `ST_GeogFromText('POINT(${centerPoint.longitude} ${centerPoint.latitude})')`
    return `ST_DWithin(${locationColumn}::geography, ${point}, ${radiusKm * 1000})`
  }

  /**
   * Get distance calculation SQL fragment
   * Returns distance in kilometers
   */
  getDistanceQuery(
    centerPoint: { latitude: number; longitude: number },
    locationColumn: string = 'location'
  ): string {
    const point = `ST_GeogFromText('POINT(${centerPoint.longitude} ${centerPoint.latitude})')`
    return `ST_Distance(${locationColumn}::geography, ${point}) / 1000 as distance_km`
  }
}
