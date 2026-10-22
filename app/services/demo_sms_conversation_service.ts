import { DateTime } from 'luxon'
import Job from '#models/job'
import SmsConversationRead from '#models/sms_conversation_read'
import { NotFoundException } from '#exceptions/generic/not_found_exception'
import { getAvailableSosSmsCommands } from '#services/sos_sms_protocol'
import type { JobStatus } from '#types/assistance'
import CompletionDispute from '#models/completion_dispute'
import db from '@adonisjs/lucid/services/db'

type ConversationFilter = 'pending' | 'in_progress' | 'all'

export class DemoSmsConversationService {
  private reference(requestId: number) {
    return `SOS-${requestId.toString().padStart(6, '0')}`
  }

  private async loadConversation(requestId: number) {
    return Job.query()
      .where('id', requestId)
      .preload('professional')
      .preload('smsMessages', (query) => {
        query.preload('professional').orderBy('createdAt', 'asc')
      })
      .first()
  }

  async list({
    operatorId,
    filter,
    search,
  }: {
    operatorId: number
    filter: ConversationFilter
    search?: string
  }) {
    const statuses: Record<Exclude<ConversationFilter, 'all'>, JobStatus[]> = {
      pending: ['open', 'accepted'],
      in_progress: ['started', 'awaiting_customer_confirmation', 'completion_disputed'],
    }

    const query = Job.query()
      .whereNotNull('professionalId')
      .preload('professional')
      .orderBy('createdAt', 'desc')
      .limit(500)

    if (filter !== 'all') query.whereIn('status', statuses[filter])

    const jobs = await query
    const jobIds = jobs.map((job) => job.id)
    const [latestMessages, latestIncomingMessages, reads] = jobIds.length
      ? await Promise.all([
          db
            .from('sms_messages')
            .distinctOn('job_id')
            .select('job_id', 'body', 'created_at')
            .whereIn('job_id', jobIds)
            .orderBy('job_id', 'asc')
            .orderBy('created_at', 'desc'),
          db
            .from('sms_messages')
            .distinctOn('job_id')
            .select('job_id', 'created_at')
            .whereIn('job_id', jobIds)
            .where('direction', 'inbound')
            .orderBy('job_id', 'asc')
            .orderBy('created_at', 'desc'),
          SmsConversationRead.query().where('userId', operatorId).whereIn('jobId', jobIds),
        ])
      : [[], [], []]

    const latestMessagesByJob = new Map(latestMessages.map((message) => [message.job_id, message]))
    const latestIncomingByJob = new Map(
      latestIncomingMessages.map((message) => [message.job_id, message])
    )
    const readsByJob = new Map(reads.map((read) => [read.jobId, read.lastReadAt]))
    const normalizedSearch = search?.trim().toLocaleLowerCase('pt')

    return jobs
      .filter((job) => {
        if (!normalizedSearch) return true
        return (
          job.professional?.name.toLocaleLowerCase('pt').includes(normalizedSearch) ||
          this.reference(job.id).toLocaleLowerCase('pt').includes(normalizedSearch)
        )
      })
      .map((job) => {
        const latestMessage = latestMessagesByJob.get(job.id)
        const latestIncoming = latestIncomingByJob.get(job.id)
        const lastReadAt = readsByJob.get(job.id)
        const lastActivityAt = latestMessage
          ? DateTime.fromJSDate(latestMessage.created_at)
          : job.createdAt

        return {
          requestId: job.id,
          reference: this.reference(job.id),
          professionalName: job.professional?.name ?? 'Mecânico',
          status: job.status,
          lastMessage: latestMessage?.body ?? 'Sem mensagens',
          lastActivityAt: lastActivityAt.toISO()!,
          unread: Boolean(
            latestIncoming &&
            (!lastReadAt || DateTime.fromJSDate(latestIncoming.created_at) > lastReadAt)
          ),
        }
      })
      .sort(
        (left, right) =>
          DateTime.fromISO(right.lastActivityAt).toMillis() -
          DateTime.fromISO(left.lastActivityAt).toMillis()
      )
  }

  async get(requestId: number, operatorId: number) {
    const job = await this.loadConversation(requestId)
    if (!job || !job.professional) throw new NotFoundException('Conversa SMS')

    await SmsConversationRead.updateOrCreate(
      { jobId: requestId, userId: operatorId },
      { lastReadAt: DateTime.now() }
    )

    return {
      requestId: job.id,
      reference: this.reference(job.id),
      status: job.status,
      professional: {
        id: job.professional.id,
        name: job.professional.name,
        msisdn: job.professional.msisdn,
      },
      messages: job.smsMessages.map((message) => ({
        id: message.id,
        direction: message.direction,
        body: message.body,
        source: message.source,
        senderName:
          message.direction === 'outbound'
            ? 'Mechanics'
            : (message.professional?.name ?? job.professional?.name ?? 'Mecânico'),
        createdAt: message.createdAt.toISO(),
      })),
      availableCommands: getAvailableSosSmsCommands(job.status, job.id),
      createdAt: job.createdAt.toISO()!,
    }
  }

  async getProfessionalForRequest(requestId: number) {
    const job = await Job.query().where('id', requestId).preload('professional').first()
    if (!job || !job.professional) throw new NotFoundException('Conversa SMS')
    return { job, professional: job.professional }
  }

  async listDisputes() {
    const disputes = await CompletionDispute.query()
      .preload('client')
      .preload('professional')
      .orderBy('createdAt', 'desc')

    return disputes.map((dispute) => ({
      id: dispute.id,
      requestId: dispute.jobId,
      reference: this.reference(dispute.jobId),
      reason: dispute.reason,
      description: dispute.description,
      status: dispute.status,
      client: { id: dispute.client.id, name: dispute.client.name },
      professional: { id: dispute.professional.id, name: dispute.professional.name },
      createdAt: dispute.createdAt.toISO(),
      resolvedAt: dispute.resolvedAt?.toISO() ?? null,
    }))
  }
}
