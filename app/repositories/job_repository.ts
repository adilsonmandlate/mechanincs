import Job from '#models/job'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'

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
   * Finds latest accepted job by professional ID
   */
  async findAcceptedJobByProfessionalId(professionalId: number): Promise<Job | null> {
    return await Job.query()
      .where('professional_id', professionalId)
      .where('status', 'accepted')
      .orderBy('created_at', 'desc')
      .first()
  }

  /**
   * Finds latest started job by professional ID
   */
  async findStartedJobByProfessionalId(professionalId: number): Promise<Job | null> {
    return await Job.query()
      .where('professional_id', professionalId)
      .where('status', 'started')
      .orderBy('created_at', 'desc')
      .first()
  }

  /**
   * Finds latest active job (not completed/canceled) by client user ID
   */
  async findActiveByUserId(userId: number): Promise<Job | null> {
    return await Job.query()
      .where('user_id', userId)
      .whereNotIn('status', ['completed', 'canceled'])
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
   * Marks job as started
   */
  async start(id: number, trx?: TransactionClientContract): Promise<Job | null> {
    return await this.update(
      id,
      {
        status: 'started',
      },
      trx
    )
  }

  /**
   * Marks job as completed and resolved
   */
  async complete(id: number, trx?: TransactionClientContract): Promise<Job | null> {
    return await this.update(
      id,
      {
        status: 'completed',
        resolved: true,
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
   * Calculates distance in km between job location and professional profile location.
   * Uses PostGIS ST_Distance in the database so it does not depend on how the driver
   * serializes geography columns (e.g. WKT vs EWKB).
   */
  async calculateDistanceToProfessional(
    jobId: number,
    professionalProfileId: number
  ): Promise<number> {
    const result = await db.rawQuery(
      `
      SELECT ST_Distance(j.location::geography, pp.location::geography) / 1000 as distance_km
      FROM jobs j
      CROSS JOIN professional_profiles pp
      WHERE j.id = ? AND pp.id = ?
      `,
      [jobId, professionalProfileId]
    )
    return Number.parseFloat(result.rows[0]?.distance_km ?? '0')
  }
}
