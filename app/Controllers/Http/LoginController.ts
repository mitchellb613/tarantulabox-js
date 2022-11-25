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
    const payload = await ctx.request.validate({
      schema: loginSchema,
    })
    await ctx.auth.use('web').attempt(payload.email, payload.password)
    ctx.session.flash('global_message', 'Successfully logged in')
    return ctx.response.redirect('/user/tarantulas')
  }
}
