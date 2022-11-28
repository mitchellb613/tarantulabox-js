import { DateTime } from 'luxon'
import { column, BaseModel, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Tarantula from './Tarantula'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public file_count: number

  @column()
  public email: string

  @column()
  public rememberMeToken: string | null

  @hasMany(() => Tarantula, {
    foreignKey: 'user_id',
  })
  public tarantulas: HasMany<typeof Tarantula>

  @column()
  public notify: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
