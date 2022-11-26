import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import TarantulaValidator from 'App/Validators/TarantulaValidator'
import Drive from '@ioc:Adonis/Core/Drive'
import Tarantula from 'App/Models/Tarantula'
import User from 'App/Models/User'

export default class TarantulaController {
  public async createForm(ctx: HttpContextContract) {
    return await ctx.view.render('create')
  }

  public async create(ctx: HttpContextContract) {
    const payload = await ctx.request.validate(TarantulaValidator)
    const user = await User.findOrFail(ctx.auth.user?.id)
    if (payload.tarantula_image) {
      await payload.tarantula_image.moveToDisk('/')
    }
    await user.related('tarantulas').create({
      name: payload.name,
      species: payload.species,
      img_url: payload.tarantula_image?.fileName ?? null,
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
        if (!t.img_url) {
          return {
            ...t.$attributes,
          }
        }
        const signed_url = await Drive.getSignedUrl(t.img_url)
        return {
          ...t.$attributes,
          img_url: signed_url,
        }
      })
    )
    return await ctx.view.render('dashboard', { tarantulas: tarantulas_signed })
  }

  public async readOne(ctx: HttpContextContract) {
    if (!ctx.auth.user) {
      return ctx.response.internalServerError('500')
    }
    const tarantula = await Tarantula.query()
      .where('id', ctx.params.tarantulaId)
      .andWhere('user_id', ctx.auth.user.id)
      .preload('molts')
      .firstOrFail()
    const molts = await Promise.all(
      tarantula.molts.map(async (molt) => {
        if (!molt.img_url) {
          return molt.$attributes
        }
        const signed_url = await Drive.getSignedUrl(molt.img_url)
        return {
          ...molt.$attributes,
          img_url: signed_url,
        }
      })
    )
    if (tarantula.img_url) {
      tarantula.img_url = await Drive.getSignedUrl(tarantula.img_url)
    }
    return await ctx.view.render('tarantula', { tarantula: tarantula, molts: molts })
  }

  public async updateForm(ctx: HttpContextContract) {
    const tarantula = await Tarantula.findOrFail(ctx.params.tarantulaId)
    if (tarantula.user_id != ctx.auth.user?.id) {
      return ctx.response.unauthorized('Unauthorized')
    }
    return await ctx.view.render('edit', { tarantula: tarantula })
  }
  public async update(ctx: HttpContextContract) {
    const payload = await ctx.request.validate(TarantulaValidator)
    const tarantula = await Tarantula.findOrFail(ctx.params.tarantulaId)
    if (tarantula.user_id != ctx.auth.user?.id) {
      return ctx.response.unauthorized('Unauthorized')
    }
    if (tarantula.img_url && payload.tarantula_image) {
      Drive.delete(tarantula.img_url)
    }
    if (payload.tarantula_image) {
      await payload.tarantula_image.moveToDisk('/')
      tarantula.img_url = payload.tarantula_image.fileName ?? tarantula.img_url
    }
    tarantula.name = payload.name
    tarantula.species = payload.species
    tarantula.next_feed_date = payload.next_feed_date
    tarantula.feed_interval_days = payload.feed_interval_days
    await tarantula.save()
    ctx.session.flash('global_message', 'Tarantula updated')
    return ctx.response.redirect('/user/tarantulas')
  }
  public async delete(ctx: HttpContextContract) {
    const tarantula = await Tarantula.query()
      .where('id', ctx.params.tarantulaId)
      .preload('molts')
      .firstOrFail()
    if (tarantula.user_id != ctx.auth.user?.id) {
      return ctx.response.unauthorized('Unauthorized')
    }
    if (tarantula.img_url) {
      Drive.delete(tarantula.img_url)
    }
    for (const molt of tarantula.molts) {
      if (molt.img_url) {
        Drive.delete(molt.img_url)
      }
    }
    await tarantula.delete()
    ctx.session.flash('global_message', 'Tarantula deleted')
    return ctx.response.redirect('/user/tarantulas')
  }
}
