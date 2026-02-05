import Expertise from '#models/expertise'

export class ExpertiseRepository {
  /**
   * Finds all expertises by profession ID
   */
  async findByProfessionId(professionId: number): Promise<Expertise[]> {
    return await Expertise.query().where('profession_id', professionId).orderBy('name', 'asc')
  }
}
