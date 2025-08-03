import { AppException } from '#exceptions/app_exception'

export class BadRequestException extends AppException {
  constructor(message = 'Requisição inválida', code = 'E_BAD_REQUEST') {
    super(message, 400, code)
  }
}
