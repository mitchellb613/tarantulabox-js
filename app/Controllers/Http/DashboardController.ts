import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Drive from '@ioc:Adonis/Core/Drive'
import User from 'App/Models/User'

export default class DashboardController {
  public async index(ctx: HttpContextContract) {
    try {
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
      return await ctx.view.render('dashboard', { tarantulas: tarantulas_signed })
    } catch (error) {
      return ctx.response.internalServerError('500')
    }
  }
}
