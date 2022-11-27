import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class LoginController {
  public async index(ctx: HttpContextContract) {
    return await ctx.view.render('login')
  }

  public async githubCallback(ctx: HttpContextContract) {
    const github = ctx.ally.use('github')

    if (github.accessDenied()) {
      ctx.session.flash('global_message', 'Access denied, please try again')
      return ctx.response.redirect('/user/login')
    }

    if (github.stateMisMatch()) {
      ctx.session.flash('global_message', 'Request expired, please try again')
      return ctx.response.redirect('/user/login')
    }

    if (github.hasError()) {
      ctx.session.flash('global_message', 'Login failed, please try again')
      return ctx.response.redirect('/user/login')
    }

    const githubUser = await github.user()

    const user = await User.firstOrCreate({
      email: githubUser.email ?? undefined,
    })

    await ctx.auth.use('web').login(user)
    return ctx.response.redirect('/user/tarantulas')
  }

  public async discordCallback(ctx: HttpContextContract) {
    const discord = ctx.ally.use('discord')

    if (discord.accessDenied()) {
      ctx.session.flash('global_message', 'Access denied, please try again')
      return ctx.response.redirect('/user/login')
    }

    if (discord.stateMisMatch()) {
      ctx.session.flash('global_message', 'Request expired, please try again')
      return ctx.response.redirect('/user/login')
    }

    if (discord.hasError()) {
      ctx.session.flash('global_message', 'Login failed, please try again')
      return ctx.response.redirect('/user/login')
    }

    const discordUser = await discord.user()

    const user = await User.firstOrCreate({
      email: discordUser.email ?? undefined,
    })

    await ctx.auth.use('web').login(user)
    return ctx.response.redirect('/user/tarantulas')
  }
}
