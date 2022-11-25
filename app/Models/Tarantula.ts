import { DateTime } from 'luxon'
import { BaseModel, belongsTo, BelongsTo, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Molt from './Molt'

export default class Tarantula extends BaseModel {
  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @column({ isPrimary: true })
  public id: number

  @column()
  public user_id: number

  @column()
  public name: string

  @column()
  public species: string

  @column()
  public img_url: string | null

  @column()
  public feed_interval_days: number

  @column.dateTime()
  public next_feed_date: DateTime

  @hasMany(() => Molt, {
    foreignKey: 'tarantula_id',
  })
  public molts: HasMany<typeof Molt>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
