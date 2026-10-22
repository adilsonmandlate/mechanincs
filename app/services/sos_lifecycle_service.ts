import { inject } from '@adonisjs/core/container'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import Job from '#models/job'
import JobEvent from '#models/job_event'
import CompletionDispute from '#models/completion_dispute'
import { NotFoundException } from '#exceptions/generic/not_found_exception'
import { BadRequestException } from '#exceptions/generic/bad_request_exception'
import { AssistanceRealtimeService } from '#services/assistance_realtime_service'
import type { CompletionDisputeReason, JobEventType, JobStatus } from '#types/assistance'
import type { AssistanceRealtimeEventType } from '#services/assistance_realtime_service'

@inject()
export class SosLifecycleService {
  constructor(private realtime: AssistanceRealtimeService) {}

  private async transition({
    requestId,
    actorId,
    expectedProfessionalId,
    expectedClientId,
    allowedStatuses,
    idempotentStatuses,
    targetStatus,
    eventType,
    realtimeType,
    metadata,
    apply,
  }: {
    requestId: number
    actorId: number
    expectedProfessionalId?: number
    expectedClientId?: number
    allowedStatuses: JobStatus[]
    idempotentStatuses: JobStatus[]
    targetStatus: JobStatus
    eventType: JobEventType
    realtimeType: AssistanceRealtimeEventType
    metadata: Record<string, unknown>
    apply?: (job: Job) => void
  }) {
    const result = await db.transaction(async (trx) => {
      const job = await Job.query({ client: trx }).where('id', requestId).forUpdate().first()
      if (!job) throw new NotFoundException('Pedido SOS')

      if (expectedProfessionalId && job.professionalId !== expectedProfessionalId) {
        throw new BadRequestException('Este pedido não pertence a você.')
      }

      if (expectedClientId && job.userId !== expectedClientId) {
        throw new NotFoundException('Pedido SOS')
      }

      if (idempotentStatuses.includes(job.status))
        return { job, changed: false, eventId: undefined }
      if (!allowedStatuses.includes(job.status)) {
        throw new BadRequestException('Esta alteração já não é permitida para o estado actual.')
      }

      job.status = targetStatus
      apply?.(job)
      await job.save()

      const event = await JobEvent.create(
        { jobId: job.id, eventType, userId: actorId, metadata },
        { client: trx }
      )

      return { job, changed: true, eventId: event.id }
    })

    if (result.changed) {
      this.realtime.publish({
        requestId,
        type: realtimeType,
        status: result.job.status,
        resourceId: result.eventId,
      })
    }

    return result
  }

  accept(requestId: number, professionalId: number, source: 'sms' | 'user' | 'demo_simulation') {
    return this.transition({
      requestId,
      actorId: professionalId,
      expectedProfessionalId: professionalId,
      allowedStatuses: ['open'],
      idempotentStatuses: [
        'accepted',
        'started',
        'awaiting_customer_confirmation',
        'completion_disputed',
        'completed',
      ],
      targetStatus: 'accepted',
      eventType: 'accepted',
      realtimeType: 'request_accepted',
      metadata: { type: 'sos', confirmedBy: source },
      apply: (job) => {
        job.confirmedAt = DateTime.now()
      },
    })
  }

  reject(requestId: number, professionalId: number, source: 'sms' | 'user' | 'demo_simulation') {
    return this.transition({
      requestId,
      actorId: professionalId,
      expectedProfessionalId: professionalId,
      allowedStatuses: ['open'],
      idempotentStatuses: ['canceled'],
      targetStatus: 'canceled',
      eventType: 'canceled',
      realtimeType: 'request_rejected',
      metadata: { type: 'sos', rejectedBy: source },
    })
  }

  start(requestId: number, professionalId: number, source: 'sms' | 'user') {
    return this.transition({
      requestId,
      actorId: professionalId,
      expectedProfessionalId: professionalId,
      allowedStatuses: ['accepted'],
      idempotentStatuses: [
        'started',
        'awaiting_customer_confirmation',
        'completion_disputed',
        'completed',
      ],
      targetStatus: 'started',
      eventType: 'started',
      realtimeType: 'work_started',
      metadata: { type: 'sos', startedBy: source },
    })
  }

  declareCompletion(requestId: number, professionalId: number, source: 'sms' | 'user') {
    return this.transition({
      requestId,
      actorId: professionalId,
      expectedProfessionalId: professionalId,
      allowedStatuses: ['started'],
      idempotentStatuses: ['awaiting_customer_confirmation', 'completion_disputed', 'completed'],
      targetStatus: 'awaiting_customer_confirmation',
      eventType: 'completion_declared',
      realtimeType: 'completion_declared',
      metadata: { type: 'sos', declaredBy: source },
      apply: (job) => {
        job.completionDeclaredAt = DateTime.now()
      },
    })
  }

  async confirmCompletion(requestId: number, clientId: number) {
    const job = await Job.find(requestId)
    if (!job) throw new NotFoundException('Pedido SOS')
    if (job.userId !== clientId) throw new NotFoundException('Pedido SOS')

    return this.transition({
      requestId,
      actorId: clientId,
      allowedStatuses: ['awaiting_customer_confirmation'],
      idempotentStatuses: ['completed'],
      targetStatus: 'completed',
      eventType: 'customer_confirmed',
      realtimeType: 'completion_confirmed',
      metadata: { type: 'sos', confirmedBy: 'client' },
      apply: (lockedJob) => {
        if (lockedJob.userId !== clientId) throw new NotFoundException('Pedido SOS')
        lockedJob.resolved = true
        lockedJob.completedAt = DateTime.now()
      },
    })
  }

  async disputeCompletion({
    requestId,
    clientId,
    reason,
    description,
  }: {
    requestId: number
    clientId: number
    reason: CompletionDisputeReason
    description?: string | null
  }) {
    const result = await db.transaction(async (trx) => {
      const job = await Job.query({ client: trx }).where('id', requestId).forUpdate().first()
      if (!job || job.userId !== clientId) throw new NotFoundException('Pedido SOS')
      if (!job.professionalId) throw new BadRequestException('Pedido sem mecânico associado.')

      if (job.status === 'completion_disputed') {
        const existing = await CompletionDispute.query({ client: trx })
          .where('jobId', requestId)
          .firstOrFail()
        return { job, dispute: existing, changed: false, eventId: undefined }
      }

      if (job.status !== 'awaiting_customer_confirmation') {
        throw new BadRequestException('Este pedido não está a aguardar confirmação.')
      }

      const dispute = await CompletionDispute.create(
        {
          jobId: job.id,
          clientId,
          professionalId: job.professionalId,
          reason,
          description: description ?? null,
          status: 'open',
        },
        { client: trx }
      )

      job.status = 'completion_disputed'
      job.resolved = false
      await job.save()

      const event = await JobEvent.create(
        {
          jobId: job.id,
          eventType: 'completion_disputed',
          userId: clientId,
          metadata: { type: 'sos', reason, disputeId: dispute.id },
        },
        { client: trx }
      )

      return { job, dispute, changed: true, eventId: event.id }
    })

    if (result.changed) {
      this.realtime.publish({
        requestId,
        type: 'completion_disputed',
        status: 'completion_disputed',
        resourceId: result.eventId,
      })
    }

    return result
  }

  cancel(requestId: number, clientId: number) {
    return this.transition({
      requestId,
      actorId: clientId,
      expectedClientId: clientId,
      allowedStatuses: ['open', 'accepted', 'started'],
      idempotentStatuses: ['canceled'],
      targetStatus: 'canceled',
      eventType: 'canceled',
      realtimeType: 'request_canceled',
      metadata: { type: 'sos', canceledBy: 'client' },
    })
  }
}
