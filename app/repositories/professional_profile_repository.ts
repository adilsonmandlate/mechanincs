import ProfessionalProfile from '#models/professional_profile'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

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
      status: 'free' | 'busy' | 'pending'
      ratingAvg: number
      ratingCount: number
    },
    trx?: TransactionClientContract
  ): Promise<ProfessionalProfile> {
    return await ProfessionalProfile.create(data, { client: trx })
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
}

