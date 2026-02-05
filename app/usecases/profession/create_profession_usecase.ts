import { inject } from '@adonisjs/core/container'
import { ProfessionRepository } from '#repositories/profession_repository'
import { BadRequestException } from '#exceptions/generic/bad_request_exception'
import type { CreateProfessionDto } from '#dtos/profession/create_profession_dto'

@inject()
export default class CreateProfessionUseCase {
  constructor(private professionRepository: ProfessionRepository) {}

  async execute({ data }: { data: CreateProfessionDto }) {
    const existing = await this.professionRepository.findByName(data.name)

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
