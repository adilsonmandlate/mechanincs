import Profession from '#models/profession'
import { NotFoundException } from '#exceptions/generic/not_found_exception'
import { DateTime } from 'luxon'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

export class ProfessionRepository {
  /**
   * Finds a profession by ID
   */
  async findById(id: number): Promise<Profession | null> {
    return await Profession.query().where('id', id).whereNull('deleted_at').first()
  }

  /**
   * Finds a profession by name
   */
  async findByName(name: string, excludeId?: number): Promise<Profession | null> {
    const query = Profession.query().where('name', name).whereNull('deleted_at')

    if (excludeId) {
      query.where('id', '!=', excludeId)
    }

    return await query.first()
  }

  /**
   * Finds a profession by ID or throws if not found
   */
  async findByIdOrFail(id: number): Promise<Profession> {
    const profession = await this.findById(id)
    if (!profession) {
      throw new NotFoundException('Profissão não encontrada.')
    }
    return profession
  }

  /**
   * Finds all active professions
   */
  async findAll(): Promise<Profession[]> {
    return await Profession.query().whereNull('deleted_at').orderBy('name', 'asc')
  }

  /**
   * Creates a new profession
   */
  async create(data: { name: string }, trx?: TransactionClientContract): Promise<Profession> {
    return await Profession.create(data, { client: trx })
  }

  /**
   * Updates a profession
   */
  async update(
    id: number,
    data: Partial<Profession>,
    trx?: TransactionClientContract
  ): Promise<Profession | null> {
    const profession = await this.findById(id)
    if (!profession) {
      return null
    }

    if (trx) {
      profession.useTransaction(trx)
    }

    profession.merge(data)
    await profession.save()

    return profession
  }

  /**
   * Suspends a profession
   */
  async suspend(id: number, trx?: TransactionClientContract): Promise<Profession | null> {
    return await this.update(id, { suspended: true }, trx)
  }

  /**
   * Unsuspends a profession
   */
  async unsuspend(id: number, trx?: TransactionClientContract): Promise<Profession | null> {
    return await this.update(id, { suspended: false }, trx)
  }

  /**
   * Soft deletes a profession
   */
  async delete(id: number, trx?: TransactionClientContract): Promise<boolean> {
    const profession = await this.findById(id)
    if (!profession) {
      return false
    }

    if (trx) {
      profession.useTransaction(trx)
    }

    profession.deletedAt = DateTime.now()
    await profession.save()

    return true
  }
}
