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

    let distance = 0
    let distanceFormatted = '0 km'
    if (professionalProfile) {
      distance = await this.jobRepository.calculateDistanceToProfessional(
        job.id,
        professionalProfile.id
      )
      distanceFormatted = `${Number.parseFloat(distance.toFixed(2))} km`
    }

    // Determine status
    let status = 'notifying'
    let message =
      'Estamos notificando o mecânico via SMS. Por favor, mantenha-se perto do seu telefone.'

    if (job.smsSentAt && !job.confirmedAt) {
      status = 'notified'
      message = 'SMS enviado para o mecânico. Aguardando confirmação...'
    } else if (job.confirmedAt && job.status === 'accepted') {
      status = 'confirmed'
      message = 'Mecânico confirmou o pedido. Agora você pode ligar para ele.'
    } else if (job.status === 'started') {
      status = 'in_progress'
      message = 'Mecânico iniciou o trabalho. Aguarde a conclusão.'
    } else if (job.status === 'completed') {
      status = 'completed'
      message = 'Trabalho concluído. Em breve você poderá avaliar o mecânico.'
    } else if (job.status === 'canceled') {
      status = 'canceled'
      message = 'Pedido cancelado.'
    }

    const hasFullProfessional =
      (status === 'confirmed' || status === 'in_progress' || status === 'completed') &&
      professional &&
      professionalProfile

    if (hasFullProfessional) {
      return {
        requestId: job.id,
        status,
        professional: {
          id: professionalProfile.id,
          userId: professional.id,
          name: professional.name,
          profilePhoto: professional.profilePhoto || null,
          msisdn: professional.msisdn,
          phoneFormatted: professional.msisdn,
          isVerified: professionalProfile.isVerified,
          rating: professionalProfile.ratingAvg,
          ratingCount: professionalProfile.ratingCount,
          profession: professionalProfile.profession?.name || 'Mecânico',
          yearsOfExperience: professionalProfile.yearsOfExperience,
          about: professionalProfile.about,
          location: professionalProfile.location,
          distance: distanceFormatted,
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
