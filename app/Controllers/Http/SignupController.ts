import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'
// import { HandleFormError } from 'helpers/HandleFormError'

export default class SignupController {
  public async index(ctx: HttpContextContract) {
    return await ctx.view.render('signup')
  }

  public async post(ctx: HttpContextContract) {
    const signupSchema = schema.create({
      email: schema.string([rules.email()]),
      password: schema.string([rules.minLength(8)]),
      notify: schema.boolean(),
    })
    const payload = await ctx.request.validate({
      schema: signupSchema,
    })
    await User.create({
      email: payload.email,
      password: payload.password,
      notify: payload.notify,
    })
    ctx.session.flash('global_message', 'Sign up successful please login')
    return ctx.response.redirect('/user/login')
  }
}
