import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class MoltValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    date: schema.date({ format: 'yyyy-MM-dd' }),
    note: schema.string.nullable([rules.minLength(1)]),
    moltImg: schema.file.optional({
      size: '2mb',
      extnames: ['jpg', 'png'],
    }),
  })
  public messages: CustomMessages = {}
}
