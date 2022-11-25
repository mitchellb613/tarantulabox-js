import { DateTime } from 'luxon'
import { BaseModel, belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Tarantula from './Tarantula'

export default class Molt extends BaseModel {
  @belongsTo(() => Tarantula)
  public tarantula: BelongsTo<typeof Tarantula>

  @column({ isPrimary: true })
  public id: number

  @column()
  public tarantula_id: number

  @column.dateTime()
  public date: DateTime

  @column()
  public note: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
