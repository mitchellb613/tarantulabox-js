import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export function HandleFormError(ctx: HttpContextContract, error) {
  ctx.session.flashExcept(['_csrf', 'password', '_method'])
  ctx.session.flash('errors', error.messages)
  return ctx.response.redirect('back', true)
}
