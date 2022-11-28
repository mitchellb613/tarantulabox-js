import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Drive from '@ioc:Adonis/Core/Drive'
import Molt from 'App/Models/Molt'
import Tarantula from 'App/Models/Tarantula'
import MoltValidator from 'App/Validators/MoltValidator'
import User from 'App/Models/User'

export default class MoltsController {
  public async createForm(ctx: HttpContextContract) {
    const tarantula = await Tarantula.findOrFail(ctx.params.tarantulaId)
    if (tarantula.user_id != ctx.auth.user?.id) {
      return ctx.response.unauthorized('Unauthorized')
    }
    return await ctx.view.render('createMolt', { tarantula: tarantula })
  }

  public async create(ctx: HttpContextContract) {
    const user = await User.findOrFail(ctx.auth.user?.id)
    const payload = await ctx.request.validate(MoltValidator)
    if (payload.moltImg) {
      user.file_count += 1
      await user.save()
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

  public async updateForm(ctx: HttpContextContract) {
    const molt = await this.getMolt(ctx)
    return await ctx.view.render('updateMolt', { molt: molt })
  }

  public async update(ctx: HttpContextContract) {
    const molt = await this.getMolt(ctx)
    const payload = await ctx.request.validate(MoltValidator)
    if (molt.img_url && payload.moltImg) {
      Drive.delete(molt.img_url)
    }
    if (payload.moltImg) {
      await payload.moltImg.moveToDisk('/')
      molt.img_url = payload.moltImg.fileName ?? molt.img_url
    }
    molt.note = payload.note
    molt.date = payload.date
    await molt.save()
    ctx.session.flash('global_message', 'Molt updated')
    return ctx.response.redirect('/user/tarantulas/' + ctx.params.tarantulaId)
  }

  public async delete(ctx: HttpContextContract) {
    const user = await User.findOrFail(ctx.auth.user?.id)
    const molt = await this.getMolt(ctx)
    if (molt.img_url) {
      user.file_count -= 1
      await user.save()
      Drive.delete(molt.img_url)
    }
    await molt.delete()
    ctx.session.flash('global_message', 'Molt deleted')
    return ctx.response.redirect('/user/tarantulas/' + ctx.params.tarantulaId)
  }

  private async getMolt(ctx: HttpContextContract) {
    if (!ctx.auth.user) {
      throw new Error('Unauthorized')
    }
    const molt = await Molt.query()
      .from('tarantulas')
      .join('molts', 'tarantulas.id', '=', 'molts.tarantula_id')
      .where('tarantulas.user_id', ctx.auth.user.id)
      .where('tarantulas.id', ctx.params.tarantulaId)
      .where('molts.id', ctx.params.moltId)
      .select('molts.*')
      .firstOrFail()
    return molt
  }
}
