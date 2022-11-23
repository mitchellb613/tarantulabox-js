import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Tarantula from 'App/Models/Tarantula'

export default class CreateTsController {
  public async index(ctx: HttpContextContract) {
    return await ctx.view.render('create')
  }

  public async post(ctx: HttpContextContract) {
    const tarantulaSchema = schema.create({
      name: schema.string([rules.minLength(1)]),
      species: schema.string([rules.minLength(1)]),
      tarantula_image: schema.file({
        size: '2mb',
        extnames: ['jpg', 'png'],
      }),
      next_feed_date: schema.date({ format: 'yyyy-MM-dd' }, [rules.after('today')]),
      feed_interval_days: schema.number([rules.range(1, 365)]),
      notify: schema.boolean(),
    })
    try {
      var payload = await ctx.request.validate({
        schema: tarantulaSchema,
      })
    } catch (error) {
      console.log(error)
      ctx.session.flashExcept(['_csrf', 'tarantula_image', '_method'])
      ctx.session.flash('errors', error.messages)
      return ctx.response.redirect('back', true)
    }
    const user_id = ctx.auth.user?.id
    await payload.tarantula_image.moveToDisk('/')
    try {
      await Tarantula.create({
        user_id: user_id,
        name: payload.name,
        species: payload.species,
        img_url: payload.tarantula_image.fileName,
        notify: payload.notify,
        next_reminder_time: payload.next_feed_date,
        reminder_interval_days: payload.feed_interval_days,
      })
      ctx.session.flash('global_message', 'Tarantula added')
      return ctx.response.redirect('/user/home')
    } catch (error) {
      return ctx.response.badRequest('Bad request')
    }
  }
}
