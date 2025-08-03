import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class JobTag extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare jobId: number

  @column()
  declare tagId: number
}
