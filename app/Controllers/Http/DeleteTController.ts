import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Tarantula from 'App/Models/Tarantula'

export default class DeleteTController {
  public async post(ctx: HttpContextContract) {
    try {
      const tarantula = await Tarantula.find(ctx.params.id)
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
      return ctx.response.internalServerError('500')
    }
  }
}
