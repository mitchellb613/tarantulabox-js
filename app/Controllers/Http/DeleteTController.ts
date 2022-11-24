import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Tarantula from 'App/Models/Tarantula'

export default class DeleteTController {
  public async post(ctx: HttpContextContract) {
    try {
      var tarantula = await Tarantula.findOrFail(ctx.params.id)
      if (!ctx.auth.user || tarantula.user_id != ctx.auth.user.id) {
        throw new Error('Unauthorized')
      }
    } catch (error) {
      return ctx.response.badRequest('Bad request')
    }
    try {
      await tarantula.delete()
      ctx.session.flash('global_message', 'Tarantula deleted')
      return ctx.response.redirect('/user/home')
    } catch (error) {
      return ctx.response.internalServerError('500')
    }
  }
}
