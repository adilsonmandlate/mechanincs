import { inject } from '@adonisjs/core/container'
import { JobRepository } from '#repositories/job_repository'
import { ProfessionalProfileRepository } from '#repositories/professional_profile_repository'
import { JobEventRepository } from '#repositories/job_event_repository'
import { SmsService } from '#services/sms_service'
import { DemoProfessionalResponseService } from '#services/demo_professional_response_service'
import { LocationService } from '#services/location_service'
import { NotFoundException } from '#exceptions/generic/not_found_exception'
import { BadRequestException } from '#exceptions/generic/bad_request_exception'
import type { CreateSosRequestDto } from '#dtos/sos/create_sos_request_dto'
import { AssistanceRealtimeService } from '#services/assistance_realtime_service'

@inject()
export default class CreateSosRequestUseCase {
  constructor(
    private jobRepository: JobRepository,
    private professionalProfileRepository: ProfessionalProfileRepository,
    private jobEventRepository: JobEventRepository,
    private smsService: SmsService,
    private demoProfessionalResponseService: DemoProfessionalResponseService,
    private locationService: LocationService,
    private realtime: AssistanceRealtimeService
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
      title: 'Pedido SOS',
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

    const assignedEvent = await this.jobEventRepository.create({
      jobId: job.id,
      eventType: 'assigned',
      userId,
      metadata: { type: 'sos', professionalId: professionalUser.id },
    })

    this.realtime.publish({
      requestId: job.id,
      type: 'request_created',
      status: job.status,
    })
    this.realtime.publish({
      requestId: job.id,
      type: 'professional_assigned',
      status: job.status,
      resourceId: assignedEvent.id,
    })

    // Send SMS to professional
    if (professionalUser.msisdn) {
      await this.smsService.sendSosRequestSms(
        professionalUser.msisdn,
        data.problemDescription,
        job.id
      )
    }

    // Update SMS sent timestamp
    await this.jobRepository.updateSmsSent(job.id)

    await this.demoProfessionalResponseService.respond({
      jobId: job.id,
      professionalUserId: professionalUser.id,
    })

    return {
      requestId: job.id,
      status: 'notifying',
      professional: {
        id: professional.id,
        name: professionalUser.name || 'Mecânico',
      },
      message: `Estamos notificando o mecânico ${professionalUser.name.split(' ')[0] || ''} via SMS. Por favor, mantenha-se perto do seu telefone.`,
      createdAt: job.createdAt,
    }
  }
}
