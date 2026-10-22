import type { JobStatus } from '#types/assistance'
import { BadRequestException } from '#exceptions/generic/bad_request_exception'

export const sosSmsCommands = {
  accept: '1',
  reject: '2',
  start: '3',
  declareCompletion: '4',
} as const

export type SosSmsCommand = (typeof sosSmsCommands)[keyof typeof sosSmsCommands]

const commandAliases: Record<SosSmsCommand, string[]> = {
  [sosSmsCommands.accept]: ['aceitar', 'aceito', 'aceita', 'aseitar', 'acitar'],
  [sosSmsCommands.reject]: ['recusar', 'recuso', 'recusa', 'rejeitar', 'recuzar', 'resusar'],
  [sosSmsCommands.start]: ['comecar', 'comeco', 'iniciar', 'inicio', 'comessar', 'comesar'],
  [sosSmsCommands.declareCompletion]: [
    'terminar',
    'terminei',
    'terminado',
    'concluir',
    'concluido',
    'finalizar',
    'finalizado',
    'acabar',
  ],
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function editDistance(left: string, right: string) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index)

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex++) {
    const current = [leftIndex]
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex++) {
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1)
      )
    }
    previous.splice(0, previous.length, ...current)
  }

  return previous[right.length]
}

function resolveTextCommand(value: string): SosSmsCommand | null {
  const exact = Object.entries(commandAliases).find(([, aliases]) => aliases.includes(value))
  if (exact) return exact[0] as SosSmsCommand

  const tolerance = value.length >= 8 ? 2 : value.length >= 5 ? 1 : 0
  if (!tolerance) return null

  const candidates = Object.entries(commandAliases)
    .flatMap(([command, aliases]) =>
      aliases.map((alias) => ({
        command: command as SosSmsCommand,
        distance: editDistance(value, alias),
      }))
    )
    .filter((candidate) => candidate.distance <= tolerance)
    .sort((left, right) => left.distance - right.distance)

  if (!candidates.length) return null
  const closest = candidates.filter((candidate) => candidate.distance === candidates[0].distance)
  return new Set(closest.map((candidate) => candidate.command)).size === 1
    ? closest[0].command
    : null
}

export function extractSosRequestId(response: string) {
  const normalized = normalize(response)
  const match = normalized.match(/(\d+)$/)
  if (!match) return null

  if (/^[1-4]\d*$/.test(normalized) && !normalized.includes(' ')) {
    const compactRequestId = normalized.slice(1)
    return compactRequestId ? Number.parseInt(compactRequestId) : null
  }

  return Number.parseInt(match[1])
}

export function parseSosSmsCommand(response: string) {
  const normalized = normalize(response)
  if (!normalized) throw new BadRequestException('Mensagem vazia.')

  const numericCommand = normalized.match(/^([1-4])(?:\s+(\d+))?$/)
  if (numericCommand) {
    return {
      command: numericCommand[1] as SosSmsCommand,
      requestId: numericCommand[2] ? Number.parseInt(numericCommand[2]) : null,
    }
  }

  if (/^[1-4]\d+$/.test(normalized)) {
    return {
      command: normalized[0] as SosSmsCommand,
      requestId: Number.parseInt(normalized.slice(1)),
    }
  }

  const requestId = extractSosRequestId(normalized)
  const commandText = normalized.replace(/\s*\d+$/, '').replace(/\s/g, '')
  const command = resolveTextCommand(commandText)
  if (!command) throw new BadRequestException('Comando inválido.')

  return { command, requestId }
}

export function getAvailableSosSmsCommands(status: JobStatus, requestId: number) {
  if (status === 'open') {
    return [
      { code: 'ACEITAR', label: 'Aceitar pedido', message: `ACEITAR ${requestId}` },
      { code: 'RECUSAR', label: 'Recusar pedido', message: `RECUSAR ${requestId}` },
    ]
  }

  if (status === 'accepted') {
    return [{ code: 'COMECAR', label: 'Começar trabalho', message: `COMECAR ${requestId}` }]
  }

  if (status === 'started') {
    return [
      {
        code: 'TERMINAR',
        label: 'Terminar trabalho',
        message: `TERMINAR ${requestId}`,
      },
    ]
  }

  return []
}
