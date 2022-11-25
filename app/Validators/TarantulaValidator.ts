import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class TarantulaValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string([rules.minLength(1)]),
    species: schema.string([rules.minLength(1)]),
    tarantula_image: schema.file.optional({
      size: '2mb',
      extnames: ['jpg', 'png'],
    }),
    next_feed_date: schema.date({ format: 'yyyy-MM-dd' }, [rules.after('today')]),
    feed_interval_days: schema.number([rules.range(1, 365)]),
  })
  public messages: CustomMessages = {}
}
