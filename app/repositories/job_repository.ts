import Job from '#models/job'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'
import { LocationService } from '#services/location_service'

export class JobRepository {
  /**
   * Creates a new job
   */
  async create(
    data: {
      userId: number
      professionalId: number | null
      title: string
      description: string
      photo: string | null
      location: string
      status: 'open' | 'accepted' | 'started' | 'completed' | 'canceled'
      resolved: boolean
    },
    trx?: TransactionClientContract
  ): Promise<Job> {
    return await Job.create(data, { client: trx })
  }

  /**
   * Finds a job by ID
   */
  async findById(id: number): Promise<Job | null> {
    return await Job.find(id)
  }

  /**
   * Finds open job by professional ID
   */
  async findOpenJobByProfessionalId(professionalId: number): Promise<Job | null> {
    return await Job.query()
      .where('professional_id', professionalId)
      .where('status', 'open')
      .orderBy('created_at', 'desc')
      .first()
  }

  /**
   * Finds a job by ID with relations loaded
   */
  async findByIdWithRelations(id: number): Promise<Job | null> {
    return await Job.query()
      .where('id', id)
      .preload('client')
      .preload('professional', (query) => {
        query.preload('professionalProfile', (profileQuery) => {
          profileQuery.preload('profession')
        })
      })
      .first()
  }

  /**
   * Updates a job
   */
  async update(
    id: number,
    data: Partial<Job>,
    trx?: TransactionClientContract
  ): Promise<Job | null> {
    const job = await Job.find(id)
    if (!job) {
      return null
    }

    if (trx) {
      job.useTransaction(trx)
    }

    job.merge(data)
    await job.save()

    return job
  }

  /**
   * Updates SMS sent timestamp
   */
  async updateSmsSent(id: number, trx?: TransactionClientContract): Promise<Job | null> {
    return await this.update(id, { smsSentAt: DateTime.now() }, trx)
  }

  /**
   * Updates confirmed timestamp and status
   */
  async confirm(
    id: number,
    professionalId: number,
    trx?: TransactionClientContract
  ): Promise<Job | null> {
    return await this.update(
      id,
      {
        professionalId,
        status: 'accepted',
        confirmedAt: DateTime.now(),
      },
      trx
    )
  }

  /**
   * Rejects a job
   */
  async reject(id: number, trx?: TransactionClientContract): Promise<Job | null> {
    return await this.update(id, { status: 'canceled' }, trx)
  }

  /**
   * Cancels a job
   */
  async cancel(id: number, trx?: TransactionClientContract): Promise<Job | null> {
    return await this.update(id, { status: 'canceled' }, trx)
  }

  /**
   * Calculates distance between job location and professional location
   */
  async calculateDistanceToProfessional(
    jobId: number,
    professionalLocation: string
  ): Promise<number> {
    const job = await this.findById(jobId)
    if (!job || !job.location) {
      return 0
    }

    const locationService = new LocationService()

    // Extract coordinates from PostGIS strings
    const jobMatch = job.location.match(/POINT\(([\d.]+)\s+([\d.]+)\)/)
    const profMatch = professionalLocation.match(/POINT\(([\d.]+)\s+([\d.]+)\)/)

    if (!jobMatch || !profMatch) {
      return 0
    }

    const jobPoint = {
      longitude: Number.parseFloat(jobMatch[1]),
      latitude: Number.parseFloat(jobMatch[2]),
    }
    const profPoint = {
      longitude: Number.parseFloat(profMatch[1]),
      latitude: Number.parseFloat(profMatch[2]),
    }

    return await locationService.calculateDistance(jobPoint, profPoint)
  }
}
