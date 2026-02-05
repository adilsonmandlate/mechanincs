import ProfessionalProfile from '#models/professional_profile'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { LocationService } from '#services/location_service'
import db from '@adonisjs/lucid/services/db'

export interface NearbyProfessional {
  id: number
  userId: number
  name: string
  profilePhoto: string | null
  isVerified: boolean
  rating: number
  ratingCount: number
  distance: number
  distanceFormatted: string
  profession: string
  status: string
  yearsOfExperience: number
  responseRate: number
  expertises: Array<{ id: number; name: string }>
}

export class ProfessionalProfileRepository {
  /**
   * Creates a new professional profile
   */
  async create(
    data: {
      userId: number
      professionId: number
      education: 'none' | 'primary' | 'secondary' | 'university' | 'master' | 'phd'
      yearsOfExperience: number
      about: string | null
      location: string
      isVerified?: boolean
      status: 'free' | 'busy' | 'pending'
      ratingAvg: number
      ratingCount: number
    },
    trx?: TransactionClientContract
  ): Promise<ProfessionalProfile> {
    return await ProfessionalProfile.create(data, { client: trx })
  }

  /**
   * Finds a professional profile by ID
   */
  async findById(id: number): Promise<ProfessionalProfile | null> {
    return await ProfessionalProfile.query()
      .where('id', id)
      .whereNull('deleted_at')
      .preload('user')
      .first()
  }

  /**
   * Finds a professional profile by user ID
   */
  async findByUserId(userId: number): Promise<ProfessionalProfile | null> {
    return await ProfessionalProfile.query()
      .where('user_id', userId)
      .whereNull('deleted_at')
      .first()
  }

  /**
   * Updates a professional profile
   */
  async update(
    id: number,
    data: Partial<ProfessionalProfile>,
    trx?: TransactionClientContract
  ): Promise<ProfessionalProfile | null> {
    const profile = await ProfessionalProfile.find(id)
    if (!profile) {
      return null
    }

    if (trx) {
      profile.useTransaction(trx)
    }

    profile.merge(data)
    await profile.save()

    return profile
  }

  /**
   * Finds nearby professionals within a radius
   */
  async findNearby(
    centerPoint: { latitude: number; longitude: number },
    radiusKm: number = 10,
    limit: number = 20
  ): Promise<NearbyProfessional[]> {
    const locationService = new LocationService()
    const distanceQuery = locationService.getDistanceQuery(centerPoint, 'location')

    const withinRadiusQuery = locationService.getWithinRadiusQuery(
      centerPoint,
      radiusKm,
      'location'
    )

    console.log('Within radius: ', withinRadiusQuery)

    const professionals = await ProfessionalProfile.query()
      .where('status', 'free')
      .where('is_verified', true)
      .whereNull('deleted_at')
      .preload('user')
      .preload('profession')
      .preload('expertises')
      .whereRaw(withinRadiusQuery)
      .select('*', db.raw(distanceQuery))
      .orderBy('distance_km', 'asc')
      .limit(limit)

    console.log('Professionals: ', professionals)

    return professionals.map((profile) => {
      const distance = (profile as any).distance_km || 0

      return {
        id: profile.id,
        userId: profile.userId,
        name: profile.user.name,
        profilePhoto: profile.user.profilePhoto || null,
        isVerified: profile.isVerified,
        rating: profile.ratingAvg,
        ratingCount: profile.ratingCount,
        distance: Number.parseFloat(distance.toFixed(1)),
        distanceFormatted: `${Number.parseFloat(distance.toFixed(1))} km away`,
        profession: profile.profession.name,
        status: profile.status,
        yearsOfExperience: profile.yearsOfExperience,
        responseRate: 95, // TODO: calcular do professional_stats
        expertises: profile.expertises.map((exp) => ({
          id: exp.id,
          name: exp.name,
        })),
      }
    })
  }
}
