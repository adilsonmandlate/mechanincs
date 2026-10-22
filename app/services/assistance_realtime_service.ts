import transmit from '@adonisjs/transmit/services/main'
import { DateTime } from 'luxon'
import type { JobStatus } from '#types/assistance'

export type AssistanceRealtimeEventType =
  | 'request_created'
  | 'professional_assigned'
  | 'sms_sent'
  | 'sms_received'
  | 'request_accepted'
  | 'request_rejected'
  | 'work_started'
  | 'completion_declared'
  | 'completion_confirmed'
  | 'completion_disputed'
  | 'rating_submitted'
  | 'request_canceled'

export class AssistanceRealtimeService {
  publish({
    requestId,
    type,
    status,
    resourceId,
  }: {
    requestId: number
    type: AssistanceRealtimeEventType
    status: JobStatus
    resourceId?: number
  }) {
    const payload = {
      eventId: `${requestId}:${type}:${resourceId ?? Date.now()}`,
      requestId,
      type,
      status,
      resourceId: resourceId ?? null,
      occurredAt: DateTime.utc().toISO(),
    }

    transmit.broadcast(`assistance/requests/${requestId}`, payload)
    transmit.broadcast('demo/sms/inbox', payload)
    transmit.broadcast(`demo/sms/requests/${requestId}`, payload)
  }
}
