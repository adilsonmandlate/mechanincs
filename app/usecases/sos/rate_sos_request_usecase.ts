import { inject } from '@adonisjs/core/container'
import { NotFoundException } from '#exceptions/generic/not_found_exception'
import { BadRequestException } from '#exceptions/generic/bad_request_exception'
import Rating from '#models/rating'
import type { RateSosRequestDto } from '#dtos/sos/rate_sos_request_dto'
import Job from '#models/job'
import JobEvent from '#models/job_event'
import ProfessionalProfile from '#models/professional_profile'
import db from '@adonisjs/lucid/services/db'
import { AssistanceRealtimeService } from '#services/assistance_realtime_service'

@inject()
export default class RateSosRequestUseCase {
  constructor(private realtime: AssistanceRealtimeService) {}

  async execute({
    requestId,
    userId,
    data,
  }: {
    requestId: number
    userId: number
    data: RateSosRequestDto
  }) {
    const result = await db.transaction(async (trx) => {
      const job = await Job.query({ client: trx }).where('id', requestId).forUpdate().first()

      if (!job) throw new NotFoundException('Pedido SOS')
      if (job.userId !== userId) {
        throw new BadRequestException('Você não tem permissão para avaliar este pedido.')
      }
      if (job.status !== 'completed') {
        throw new BadRequestException('Só é possível avaliar um trabalho concluído.')
      }
      if (!job.professionalId) {
        throw new BadRequestException('Pedido não possui mecânico associado.')
      }

      const existingRating = await Rating.query({ client: trx })
        .where('jobId', job.id)
        .where('userId', userId)
        .first()
      if (existingRating) return { job, rating: existingRating, changed: false, eventId: undefined }

      const rating = await Rating.create(
        {
          jobId: job.id,
          professionalId: job.professionalId,
          userId,
          stars: data.stars,
          comment: data.comment ?? null,
        },
        { client: trx }
      )

      const aggregates = await Rating.query({ client: trx })
        .where('professionalId', job.professionalId)
        .avg('stars as avg')
        .count('* as count')
        .first()

      const professionalProfile = await ProfessionalProfile.query({ client: trx })
        .where('userId', job.professionalId)
        .first()
      if (professionalProfile) {
        professionalProfile.ratingAvg = Number(aggregates?.$extras.avg ?? 0)
        professionalProfile.ratingCount = Number(aggregates?.$extras.count ?? 0)
        await professionalProfile.save()
      }

      const event = await JobEvent.create(
        {
          jobId: job.id,
          eventType: 'rated',
          userId,
          metadata: { type: 'sos', ratingId: rating.id, stars: rating.stars },
        },
        { client: trx }
      )

      return { job, rating, changed: true, eventId: event.id }
    })

    if (result.changed) {
      this.realtime.publish({
        requestId,
        type: 'rating_submitted',
        status: 'completed',
        resourceId: result.eventId,
      })
    }

    return {
      message: 'Avaliação registrada com sucesso.',
      requestId: result.job.id,
    }
  }
}
