import { inject } from '@adonisjs/core/container'
import { JobRepository } from '#repositories/job_repository'
import { NotFoundException } from '#exceptions/generic/not_found_exception'

@inject()
export default class GetSosRequestUseCase {
  constructor(private jobRepository: JobRepository) {}

  async execute({ requestId, userId }: { requestId: number; userId: number }) {
    const job = await this.jobRepository.findByIdWithRelations(requestId)

    if (!job) {
      throw new NotFoundException('Pedido SOS não encontrado.')
    }

    // Verify job belongs to user
    if (job.userId !== userId) {
      throw new NotFoundException('Pedido SOS não encontrado.')
    }

    const professional = job.professional
    const professionalProfile = professional?.professionalProfile || null

    // Calculate distance if professional profile exists
    let distance = 0
    let distanceFormatted = '0 km away'
    if (job.location && professionalProfile?.location) {
      distance = await this.jobRepository.calculateDistanceToProfessional(
        job.id,
        professionalProfile.location
      )
      distanceFormatted = `${Number.parseFloat(distance.toFixed(1))} km away`
    }

    // Determine status
    let status = 'notifying'
    let message = 'We are notifying the mechanic via SMS. Please stay close to your phone.'

    if (job.smsSentAt && !job.confirmedAt) {
      status = 'notified'
      message = 'SMS sent to mechanic. Waiting for confirmation...'
    } else if (job.confirmedAt && job.status === 'accepted') {
      status = 'confirmed'
      message = 'Mechanic confirmed! You can now call them.'
    } else if (job.status === 'canceled') {
      status = 'canceled'
      message = 'Request canceled.'
    }

    if (status === 'confirmed' && professional && professionalProfile) {
      return {
        requestId: job.id,
        status,
        professional: {
          id: professionalProfile.id,
          userId: professional.id,
          name: professional.name,
          profilePhoto: professional.profilePhoto || null,
          msisdn: professional.msisdn,
          phoneFormatted: professional.msisdn, // TODO: formatar telefone
          isVerified: professionalProfile.isVerified,
          rating: professionalProfile.ratingAvg,
          ratingCount: professionalProfile.ratingCount,
          profession: professionalProfile.profession?.name || 'Mecânico',
          yearsOfExperience: professionalProfile.yearsOfExperience,
          about: professionalProfile.about,
          location: professionalProfile.location,
          distance,
          distanceFormatted,
          responseRate: 95, // TODO: calcular
          acceptanceRate: 92, // TODO: calcular
        },
        problemDescription: job.description,
        smsSentAt: job.smsSentAt,
        confirmedAt: job.confirmedAt,
        createdAt: job.createdAt,
      }
    }

    return {
      requestId: job.id,
      status,
      professional: professional
        ? {
            id: professionalProfile?.id || 0,
            name: professional.name,
          }
        : null,
      message,
      smsSentAt: job.smsSentAt,
      confirmedAt: job.confirmedAt,
      createdAt: job.createdAt,
    }
  }
}
