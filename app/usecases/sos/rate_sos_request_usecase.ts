import { inject } from '@adonisjs/core/container'
import { JobRepository } from '#repositories/job_repository'
import { ProfessionalProfileRepository } from '#repositories/professional_profile_repository'
import { NotFoundException } from '#exceptions/generic/not_found_exception'
import { BadRequestException } from '#exceptions/generic/bad_request_exception'
import Rating from '#models/rating'
import type { RateSosRequestDto } from '#dtos/sos/rate_sos_request_dto'

@inject()
export default class RateSosRequestUseCase {
  constructor(
    private jobRepository: JobRepository,
    private professionalProfileRepository: ProfessionalProfileRepository
  ) {}

  async execute({
    requestId,
    userId,
    data,
  }: {
    requestId: number
    userId: number
    data: RateSosRequestDto
  }) {
    const job = await this.jobRepository.findById(requestId)

    if (!job) {
      throw new NotFoundException('Pedido SOS não encontrado.')
    }

    if (job.userId !== userId) {
      throw new BadRequestException('Você não tem permissão para avaliar este pedido.')
    }

    if (job.status !== 'completed') {
      throw new BadRequestException('Só é possível avaliar um trabalho concluído.')
    }

    if (!job.professionalId) {
      throw new BadRequestException('Pedido não possui mecânico associado.')
    }

    // Prevent double rating from same user for same job
    const existingRating = await Rating.query()
      .where('jobId', job.id)
      .where('userId', userId)
      .first()

    if (existingRating) {
      throw new BadRequestException('Você já avaliou este trabalho.')
    }

    await Rating.create({
      jobId: job.id,
      professionalId: job.professionalId,
      userId,
      stars: data.stars,
      comment: data.comment ?? null,
    })

    // Recalculate professional aggregates
    const aggregates = await Rating.query()
      .where('professionalId', job.professionalId)
      .avg('stars as avg')
      .count('* as count')
      .first()

    const ratingAvg = Number(aggregates?.$extras.avg ?? 0)
    const ratingCount = Number(aggregates?.$extras.count ?? 0)

    const professionalProfile = await this.professionalProfileRepository.findByUserId(
      job.professionalId
    )

    if (professionalProfile) {
      await this.professionalProfileRepository.update(professionalProfile.id, {
        ratingAvg,
        ratingCount,
      })
    }

    return {
      message: 'Avaliação registrada com sucesso.',
      requestId: job.id,
    }
  }
}
