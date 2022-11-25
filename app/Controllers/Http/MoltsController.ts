import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Drive from '@ioc:Adonis/Core/Drive'
import Molt from 'App/Models/Molt'
import Tarantula from 'App/Models/Tarantula'

export default class MoltsController {
  public async createForm(ctx: HttpContextContract) {
    const tarantula = await Tarantula.findOrFail(ctx.params.tarantulaId)
    if (tarantula.user_id != ctx.auth.user?.id) {
      return ctx.response.unauthorized('Unauthorized')
    }
    return await ctx.view.render('createMolt', { tarantula: tarantula })
  }

  public async create(ctx: HttpContextContract) {
    const moltSchema = schema.create({
      date: schema.date({ format: 'yyyy-MM-dd' }),
      note: schema.string.nullable([rules.minLength(1)]),
      moltImg: schema.file.optional({
        size: '2mb',
        extnames: ['jpg', 'png'],
      }),
    })
    const payload = await ctx.request.validate({
      schema: moltSchema,
    })
    if (payload.moltImg) {
      await payload.moltImg.moveToDisk('/')
    }
    const tarantula = await Tarantula.findOrFail(ctx.params.tarantulaId)
    if (tarantula.user_id != ctx.auth.user?.id) {
      return ctx.response.unauthorized('Unauthorized')
    }
    await tarantula.related('molts').create({
      note: payload.note,
      date: payload.date,
      img_url: payload.moltImg?.fileName,
    })
    ctx.session.flash('global_message', 'Molt added')
    ctx.response.redirect('/user/tarantulas/' + tarantula.id)
  }

  public async updateForm(ctx: HttpContextContract) {}

  public async update(ctx: HttpContextContract) {}

  public async delete(ctx: HttpContextContract) {
    if (!ctx.auth.user) {
      return ctx.response.unauthorized('Unauthorized')
    }
    const molt = await Molt.query()
      .from('tarantulas')
      .join('molts', 'tarantulas.id', '=', 'molts.tarantula_id')
      .where('tarantulas.user_id', ctx.auth.user.id)
      .where('tarantulas.id', ctx.params.tarantulaId)
      .where('molts.id', ctx.params.moltId)
      .select('molts.*')
      .firstOrFail()
    if (molt.img_url) {
      await Drive.delete(molt.img_url)
    }
    await molt.delete()
    ctx.session.flash('global_message', 'Molt deleted')
    ctx.response.redirect('/user/tarantulas/' + ctx.params.tarantulaId)
  }
}
