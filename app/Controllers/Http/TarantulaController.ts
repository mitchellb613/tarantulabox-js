import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Tarantula from 'App/Models/Tarantula'
import User from 'App/Models/User'

export default class TarantulaController {
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
    })
    try {
      if (!ctx.auth.user) {
        return ctx.response.unauthorized('Unauthorized')
      }
      const payload = await ctx.request.validate({
        schema: tarantulaSchema,
      })
      const user = await User.findOrFail(ctx.auth.user.id)
      await payload.tarantula_image.moveToDisk('/')
      await user.related('tarantulas').create({
        name: payload.name,
        species: payload.species,
        img_url: payload.tarantula_image.fileName,
        next_feed_date: payload.next_feed_date,
        feed_interval_days: payload.feed_interval_days,
      })
      ctx.session.flash('global_message', 'Tarantula added')
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

  public async indexUpdate(ctx: HttpContextContract) {
    try {
      const tarantula = await Tarantula.findOrFail(ctx.params.tarantulaId)
      if (!ctx.auth.user || tarantula.user_id != ctx.auth.user.id) {
        return ctx.response.unauthorized('Unauthorized')
      }
      return await ctx.view.render('edit', { tarantula: tarantula })
    } catch (error) {
      console.log(error)
      return ctx.response.badRequest('Bad request')
    }
  }
  public async update(ctx: HttpContextContract) {
    const tarantulaSchema = schema.create({
      name: schema.string([rules.minLength(1)]),
      species: schema.string([rules.minLength(1)]),
      next_feed_date: schema.date({ format: 'yyyy-MM-dd' }, [rules.after('today')]),
      feed_interval_days: schema.number([rules.range(1, 365)]),
    })
    try {
      const tarantula = await Tarantula.find(ctx.params.tarantulaId)
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
  public async delete(ctx: HttpContextContract) {
    try {
      const tarantula = await Tarantula.find(ctx.params.tarantulaId)
      if (!tarantula) {
        return ctx.response.badRequest('Bad Request')
      }
      if (!ctx.auth.user || tarantula.user_id != ctx.auth.user.id) {
        return ctx.response.unauthorized('Unauthorized')
      }
      await tarantula.delete()
      ctx.session.flash('global_message', 'Tarantula deleted')
      return ctx.response.redirect('/user/home')
    } catch (error) {
      console.log(error)
      return ctx.response.internalServerError('500')
    }
  }
}
