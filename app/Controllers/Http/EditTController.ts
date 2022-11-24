import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Tarantula from 'App/Models/Tarantula'

export default class EditTController {
  public async index(ctx: HttpContextContract) {
    try {
      const tarantula = await Tarantula.findOrFail(ctx.params.id)
      if (!ctx.auth.user || tarantula.user_id != ctx.auth.user.id) {
        throw new Error('Unauthorized')
      }
      return await ctx.view.render('edit', { tarantula: tarantula })
    } catch (error) {
      console.log(error)
      return ctx.response.badRequest('Bad request')
    }
  }
  public async post(ctx: HttpContextContract) {
    const tarantulaSchema = schema.create({
      name: schema.string([rules.minLength(1)]),
      species: schema.string([rules.minLength(1)]),
      next_feed_date: schema.date({ format: 'yyyy-MM-dd' }, [rules.after('today')]),
      feed_interval_days: schema.number([rules.range(1, 365)]),
    })
    try {
      const tarantula = await Tarantula.find(ctx.params.id)
      if (!tarantula) {
        return ctx.response.badRequest('Bad Request')
      }
      if (!ctx.auth.user || tarantula.user_id != ctx.auth.user.id) {
        return ctx.response.unauthorized('Unauthorized')
      }
      const payload = await ctx.request.validate({
        schema: tarantulaSchema,
      })

      tarantula.name = payload.name
      tarantula.species = payload.species
      tarantula.next_feed_date = payload.next_feed_date
      tarantula.feed_interval_days = payload.feed_interval_days
      await tarantula.save()
      ctx.session.flash('global_message', 'Tarantula updated')
      return ctx.response.redirect('/user/home')
    } catch (error) {
      if (error.code === 'E_VALIDATION_FAILURE') {
        ctx.session.flashExcept(['_csrf', '_method'])
        ctx.session.flash('errors', error.messages)
        return ctx.response.redirect('back', true)
      } else {
        return ctx.response.internalServerError('500')
      }
    }
  }
}
