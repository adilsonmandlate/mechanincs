import { inject } from '@adonisjs/core/container'
import { ProfessionRepository } from '#repositories/profession_repository'
import { NotFoundException } from '#exceptions/generic/not_found_exception'
import { BadRequestException } from '#exceptions/generic/bad_request_exception'
import type { UpdateProfessionDto } from '#dtos/profession/update_profession_dto'

@inject()
export default class UpdateProfessionUseCase {
  constructor(private professionRepository: ProfessionRepository) {}

  async execute({ id, data }: { id: number; data: UpdateProfessionDto }) {
    const profession = await this.professionRepository.findByIdOrFail(id)

    if (data.name && data.name !== profession.name) {
      const existing = await this.professionRepository.findByName(data.name, id)

      if (existing) {
        throw new BadRequestException('Uma profissão com este nome já existe.')
      }
    }

    const updated = await this.professionRepository.update(id, data)

    if (!updated) {
      throw new NotFoundException('Profissão não encontrada.')
    }

    return {
      id: updated.id,
      name: updated.name,
      suspended: updated.suspended,
    }
  }
}
