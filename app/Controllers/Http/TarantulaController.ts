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
    await user.related('tarantulas').create({
      name: payload.name,
      species: payload.species,
      img_url: payload.tarantula_image.fileName,
      next_feed_date: payload.next_feed_date,
      feed_interval_days: payload.feed_interval_days,
    })
    ctx.session.flash('global_message', 'Tarantula added')
    return ctx.response.redirect('/user/tarantulas')
  }

  public async readAll(ctx: HttpContextContract) {
    if (!ctx.auth.user) {
      return ctx.response.internalServerError('500')
    }
    const tarantulas = await Tarantula.query().where('user_id', ctx.auth.user.id)
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
    return await ctx.view.render('dashboard', { tarantulas: tarantulas_signed })
  }

  public async readOne(ctx: HttpContextContract) {
    if (!ctx.auth.user) {
      return ctx.response.internalServerError('500')
    }
    const tarantulas = await Tarantula.query()
      .where('user_id', ctx.auth.user.id)
      .andWhere('id', ctx.params.tarantulaId)
      .preload('molts')
    if (!tarantulas || tarantulas.length !== 1) {
      return ctx.response.notFound('Not found')
    }
    return await ctx.view.render('tarantula', tarantulas[0])
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
    ctx.session.flash('global_message', 'Tarantula updated')
    return ctx.response.redirect('/user/tarantulas')
  }
  public async delete(ctx: HttpContextContract) {
    const tarantula = await Tarantula.findOrFail(ctx.params.tarantulaId)
    if (tarantula.user_id != ctx.auth.user?.id) {
      return ctx.response.unauthorized('Unauthorized')
    }
    await Drive.delete(tarantula.img_url)
    await tarantula.delete()
    ctx.session.flash('global_message', 'Tarantula deleted')
    return ctx.response.redirect('/user/tarantulas')
  }
}
