import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
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
    ctx.response.redirect('/user/tarantulas/' + tarantula.id)
  }

  public async updateForm(ctx: HttpContextContract) {}

  public async update(ctx: HttpContextContract) {}

  public async delete(ctx: HttpContextContract) {}
}
