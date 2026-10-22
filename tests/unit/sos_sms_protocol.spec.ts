import { test } from '@japa/runner'
import {
  getAvailableSosSmsCommands,
  parseSosSmsCommand,
  sosSmsCommands,
} from '#services/sos_sms_protocol'

test.group('SOS SMS protocol', () => {
  test('parses commands separated from the request reference', ({ assert }) => {
    assert.deepEqual(parseSosSmsCommand('3 42'), {
      command: sosSmsCommands.start,
      requestId: 42,
    })
  })

  test('preserves compact command compatibility', ({ assert }) => {
    assert.deepEqual(parseSosSmsCommand('142'), {
      command: sosSmsCommands.accept,
      requestId: 42,
    })
  })

  test('supports commands without a request reference', ({ assert }) => {
    assert.deepEqual(parseSosSmsCommand('4'), {
      command: sosSmsCommands.declareCompletion,
      requestId: null,
    })
  })

  test('parses textual commands with or without spaces', ({ assert }) => {
    assert.deepEqual(parseSosSmsCommand('aceitar 42'), {
      command: sosSmsCommands.accept,
      requestId: 42,
    })
    assert.deepEqual(parseSosSmsCommand('recusar42'), {
      command: sosSmsCommands.reject,
      requestId: 42,
    })
    assert.deepEqual(parseSosSmsCommand('COMEÇAR 42'), {
      command: sosSmsCommands.start,
      requestId: 42,
    })
    assert.deepEqual(parseSosSmsCommand('terminar42'), {
      command: sosSmsCommands.declareCompletion,
      requestId: 42,
    })
  })

  test('accepts common spelling mistakes without guessing ambiguous words', ({ assert }) => {
    assert.equal(parseSosSmsCommand('aseitar 42').command, sosSmsCommands.accept)
    assert.equal(parseSosSmsCommand('recuzar42').command, sosSmsCommands.reject)
    assert.equal(parseSosSmsCommand('comessar 42').command, sosSmsCommands.start)
    assert.equal(parseSosSmsCommand('terminr42').command, sosSmsCommands.declareCompletion)
    assert.throws(() => parseSosSmsCommand('talvez 42'), 'Comando inválido.')
  })

  test('rejects unknown commands', ({ assert }) => {
    assert.throws(() => parseSosSmsCommand('24 1'), 'Comando inválido.')
  })

  test('derives suggestions from the current request state', ({ assert }) => {
    assert.deepEqual(getAvailableSosSmsCommands('open', 7), [
      { code: 'ACEITAR', label: 'Aceitar pedido', message: 'ACEITAR 7' },
      { code: 'RECUSAR', label: 'Recusar pedido', message: 'RECUSAR 7' },
    ])
    assert.deepEqual(getAvailableSosSmsCommands('accepted', 7), [
      { code: 'COMECAR', label: 'Começar trabalho', message: 'COMECAR 7' },
    ])
    assert.deepEqual(getAvailableSosSmsCommands('started', 7), [
      { code: 'TERMINAR', label: 'Terminar trabalho', message: 'TERMINAR 7' },
    ])
  })

  test('does not suggest transitions for terminal or customer-controlled states', ({ assert }) => {
    assert.deepEqual(getAvailableSosSmsCommands('awaiting_customer_confirmation', 7), [])
    assert.deepEqual(getAvailableSosSmsCommands('completion_disputed', 7), [])
    assert.deepEqual(getAvailableSosSmsCommands('completed', 7), [])
  })
})
