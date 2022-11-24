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
    try {
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
    } catch (error) {
      if (error.code === 'E_VALIDATION_FAILURE') {
        ctx.session.flashExcept(['_csrf', 'password', '_method'])
        ctx.session.flash('errors', error.messages)
        return ctx.response.redirect('back', true)
      } else if (error.code === '23505') {
        ctx.session.flash('email_in_use', 'Email already in use')
        return ctx.response.redirect('back', true)
      } else {
        return ctx.response.internalServerError('500')
      }
    }
  }
}
