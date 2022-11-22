import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'
// import { HandleFormError } from 'helpers/HandleFormError'

export default class SignupController {
  public async post(ctx: HttpContextContract) {
    const signupSchema = schema.create({
      email: schema.string([rules.email()]),
      password: schema.string([rules.minLength(8)]),
    })
    try {
      const payload = await ctx.request.validate({
        schema: signupSchema,
      })
      const user = await User.create({
        email: payload.email,
        password: payload.password,
      })
      return 'User created with id: ' + user.id
    } catch (error) {
      if (error.code == 23505) {
        ctx.session.flash('email_in_use_error', 'Email already in use')
      }
      //   return HandleFormError(ctx, error)
      ctx.session.flashExcept(['_csrf', 'password', '_method'])
      ctx.session.flash('errors', error.messages)
      return ctx.response.redirect('back', true)
    }
  }
}
