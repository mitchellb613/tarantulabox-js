import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Drive from '@ioc:Adonis/Core/Drive'
import Tarantula from 'App/Models/Tarantula'
import User from 'App/Models/User'

export default class TarantulaController {
  public async createForm(ctx: HttpContextContract) {
    return await ctx.view.render('create')
  }

  public async create(ctx: HttpContextContract) {
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
    const payload = await ctx.request.validate({
      schema: tarantulaSchema,
    })
    const user = await User.findOrFail(ctx.auth.user?.id)
    await payload.tarantula_image.moveToDisk('/')
    const tarantula = await user.related('tarantulas').create({
      name: payload.name,
      species: payload.species,
      img_url: payload.tarantula_image.fileName,
      next_feed_date: payload.next_feed_date,
      feed_interval_days: payload.feed_interval_days,
    })
    switch (ctx.request.accepts(['json', 'html'])) {
      case 'json':
        return ctx.response.json({ created_tarantula: tarantula })
        break

      case 'html':
        ctx.session.flash('global_message', 'Tarantula added')
        return ctx.response.redirect('/user/tarantulas')
        break

      default:
        return ctx.response.badRequest('Bad request')
    }
  }

  public async readAll(ctx: HttpContextContract) {
    const user = await User.find(ctx.auth.user?.id)
    const tarantulas = await user?.related('tarantulas').query()
    if (!tarantulas) {
      return ctx.response.internalServerError('500')
    }
    const tarantulas_signed = await Promise.all(
      tarantulas.map(async (t) => {
        const signed_url = await Drive.getSignedUrl(t.img_url)
        return {
          ...t.$attributes,
          signed_url: signed_url,
        }
      })
    )
    switch (ctx.request.accepts(['json', 'html'])) {
      case 'json':
        return ctx.response.json({ tarantulas: tarantulas_signed })
        break

      case 'html':
        return await ctx.view.render('dashboard', { tarantulas: tarantulas_signed })
        break

      default:
        return ctx.response.badRequest('Bad request')
    }
  }

  public async updateForm(ctx: HttpContextContract) {
    const tarantula = await Tarantula.findOrFail(ctx.params.tarantulaId)
    if (tarantula.user_id != ctx.auth.user?.id) {
      return ctx.response.unauthorized('Unauthorized')
    }
    return await ctx.view.render('edit', { tarantula: tarantula })
  }
  public async update(ctx: HttpContextContract) {
    const tarantulaSchema = schema.create({
      name: schema.string([rules.minLength(1)]),
      species: schema.string([rules.minLength(1)]),
      next_feed_date: schema.date({ format: 'yyyy-MM-dd' }, [rules.after('today')]),
      feed_interval_days: schema.number([rules.range(1, 365)]),
    })
    const tarantula = await Tarantula.findOrFail(ctx.params.tarantulaId)
    if (tarantula.user_id != ctx.auth.user?.id) {
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
    switch (ctx.request.accepts(['json', 'html'])) {
      case 'json':
        return ctx.response.json({ updated_tarantula: tarantula })
        break

      case 'html':
        ctx.session.flash('global_message', 'Tarantula updated')
        return ctx.response.redirect('/user/tarantulas')
        break

      default:
        return ctx.response.badRequest('Bad request')
    }
  }
  public async delete(ctx: HttpContextContract) {
    const tarantula = await Tarantula.findOrFail(ctx.params.tarantulaId)
    if (tarantula.user_id != ctx.auth.user?.id) {
      return ctx.response.unauthorized('Unauthorized')
    }
    await tarantula.delete()
    switch (ctx.request.accepts(['json', 'html'])) {
      case 'json':
        return ctx.response.json({ deleted_tarantula: tarantula })
        break

      case 'html':
        ctx.session.flash('global_message', 'Tarantula deleted')
        return ctx.response.redirect('/user/tarantulas')
        break

      default:
        return ctx.response.badRequest('Bad request')
    }
  }
}
