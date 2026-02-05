import { inject } from '@adonisjs/core/container'
import { JobRepository } from '#repositories/job_repository'
import { ProfessionalProfileRepository } from '#repositories/professional_profile_repository'
import { JobEventRepository } from '#repositories/job_event_repository'
import { UserRepository } from '#repositories/user_repository'
import { SmsService } from '#services/sms_service'
import { LocationService } from '#services/location_service'
import { NotFoundException } from '#exceptions/generic/not_found_exception'
import { BadRequestException } from '#exceptions/generic/bad_request_exception'
import type { CreateSosRequestDto } from '#dtos/sos/create_sos_request_dto'

@inject()
export default class CreateSosRequestUseCase {
  constructor(
    private jobRepository: JobRepository,
    private professionalProfileRepository: ProfessionalProfileRepository,
    private jobEventRepository: JobEventRepository,
    private userRepository: UserRepository,
    private smsService: SmsService,
    private locationService: LocationService
  ) {}

  async execute({ userId, data }: { userId: number; data: CreateSosRequestDto }) {
    const professional = await this.professionalProfileRepository.findById(data.professionalId)
    if (!professional) {
      throw new NotFoundException('Mecânico não encontrado.')
    }

    if (professional.status !== 'free') {
      throw new BadRequestException('Mecânico não está disponível no momento.')
    }

    if (professional.deletedAt) {
      throw new NotFoundException('Mecânico não encontrado.')
    }

    // Get professional user
    const professionalUser = professional.user
    if (!professionalUser) {
      throw new NotFoundException('Mecânico não encontrado.')
    }

    // Convert location to PostGIS POINT
    const locationPoint = this.locationService.toPostGISPoint(data.location)

    // Create job
    const job = await this.jobRepository.create({
      userId,
      professionalId: professionalUser.id,
      title: 'SOS Request',
      description: data.problemDescription,
      photo: null,
      location: locationPoint,
      status: 'open',
      resolved: false,
    })

    // Create job event
    await this.jobEventRepository.create({
      jobId: job.id,
      eventType: 'created',
      userId,
      metadata: { type: 'sos' },
    })

    const client = await this.userRepository.findById(userId)
    const clientName = client?.name || 'Cliente'

    // Send SMS to professional
    if (professionalUser.msisdn) {
      await this.smsService.sendSosRequestSms(professionalUser.msisdn, clientName)
    }

    // Update SMS sent timestamp
    await this.jobRepository.updateSmsSent(job.id)

    return {
      requestId: job.id,
      status: 'notifying',
      professional: {
        id: professional.id,
        name: professionalUser.name || 'Mecânico',
      },
      message: `We are notifying Mechanic ${professionalUser.name || 'the mechanic'} via SMS. Please stay close to your phone.`,
      createdAt: job.createdAt,
    }
  }
}
