import { AppException } from '#exceptions/app_exception'

export class NotFoundException extends AppException {
  constructor(resource: string = 'Recurso') {
    super(`${resource} não encontrado`, 404, 'E_NOT_FOUND')
  }
}
