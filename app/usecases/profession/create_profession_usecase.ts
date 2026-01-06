import { inject } from '@adonisjs/core/container'
import { ProfessionRepository } from '#repositories/profession_repository'
import { BadRequestException } from '#exceptions/generic/bad_request_exception'
import type { CreateProfessionDto } from '#dtos/profession/create_profession_dto'
import Profession from '#models/profession'

@inject()
export default class CreateProfessionUseCase {
  constructor(private professionRepository: ProfessionRepository) {}

  async execute({ data }: { data: CreateProfessionDto }) {
    // Check if profession with same name already exists
    const existing = await Profession.query()
      .where('name', data.name)
      .whereNull('deleted_at')
      .first()

    if (existing) {
      throw new BadRequestException('Uma profissão com este nome já existe.')
    }

    const profession = await this.professionRepository.create(data)

    return {
      id: profession.id,
      name: profession.name,
      suspended: profession.suspended,
    }
  }
}
