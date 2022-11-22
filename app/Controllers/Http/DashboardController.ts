import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class DashboardController {
  public async index(ctx: HttpContextContract) {
    const user = await User.find(ctx.auth.user?.id)
    const tarantulas = await user?.related('tarantulas').query()
    return await ctx.view.render('dashboard', { tarantulas: tarantulas })
  }
}
