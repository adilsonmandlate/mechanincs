import { inject } from '@adonisjs/core/container'
import { ProfessionRepository } from '#repositories/profession_repository'
import { NotFoundException } from '#exceptions/generic/not_found_exception'
import { BadRequestException } from '#exceptions/generic/bad_request_exception'
import type { UpdateProfessionDto } from '#dtos/profession/update_profession_dto'
import Profession from '#models/profession'

@inject()
export default class UpdateProfessionUseCase {
  constructor(private professionRepository: ProfessionRepository) {}

  async execute({ id, data }: { id: number; data: UpdateProfessionDto }) {
    const profession = await this.professionRepository.findByIdOrFail(id)

    // If updating name, check if another profession with same name exists
    if (data.name && data.name !== profession.name) {
      const existing = await Profession.query()
        .where('name', data.name)
        .where('id', '!=', id)
        .whereNull('deleted_at')
        .first()

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
