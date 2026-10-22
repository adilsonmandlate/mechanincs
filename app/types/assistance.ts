export const jobStatuses = [
  'open',
  'accepted',
  'started',
  'awaiting_customer_confirmation',
  'completion_disputed',
  'completed',
  'canceled',
] as const

export type JobStatus = (typeof jobStatuses)[number]

export const jobEventTypes = [
  'created',
  'assigned',
  'accepted',
  'started',
  'sms_sent',
  'sms_received',
  'completion_declared',
  'customer_confirmed',
  'completion_disputed',
  'completed',
  'rated',
  'canceled',
] as const

export type JobEventType = (typeof jobEventTypes)[number]

export const completionDisputeReasons = [
  'work_not_completed',
  'vehicle_problem_persists',
  'service_not_performed',
  'new_problem_after_service',
  'professional_conduct',
  'other',
] as const

export type CompletionDisputeReason = (typeof completionDisputeReasons)[number]
