import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class LoginController {
  public async index(ctx: HttpContextContract) {
    return await ctx.view.render('login')
  }

  public async post(ctx: HttpContextContract) {
    const loginSchema = schema.create({
      email: schema.string([rules.email()]),
      password: schema.string([rules.minLength(8)]),
    })
    try {
      const payload = await ctx.request.validate({
        schema: loginSchema,
      })
      await ctx.auth.use('web').attempt(payload.email, payload.password)
      ctx.session.flash('global_message', 'Successfully logged in')
      return ctx.response.redirect('/user/home')
    } catch (error) {
      if (error.code === 'E_VALIDATION_FAILURE') {
        ctx.session.flashExcept(['_csrf', 'password', '_method'])
        ctx.session.flash('errors', error.messages)
        return ctx.response.redirect('back', true)
      } else if (error.code === 'E_INVALID_AUTH_UID' || error.code === 'E_INVALID_AUTH_PASSWORD') {
        ctx.session.flashExcept(['_csrf', 'password', '_method'])
        ctx.session.flash('global_message', 'Invalid credentials')
        return ctx.response.redirect('back', true)
      } else {
        return ctx.response.internalServerError('500')
      }
    }
  }
}
