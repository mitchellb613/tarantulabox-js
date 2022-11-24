import { BaseMailer, MessageContract } from '@ioc:Adonis/Addons/Mail'
import Tarantula from 'App/Models/Tarantula'
import User from 'App/Models/User'

export default class ReminderEmail extends BaseMailer {
  /**
   * WANT TO USE A DIFFERENT MAILER?
   *
   * Uncomment the following line of code to use a different
   * mailer and chain the ".options" method to pass custom
   * options to the send method
   */
  // public mailer = this.mail.use()

  /**
   * The prepare method is invoked automatically when you run
   * "ReminderEmail.send".
   *
   * Use this method to prepare the email message. The method can
   * also be async.
   */
  constructor(private user: User, private tarantulas: Tarantula[]) {
    super()
  }

  public prepare(message: MessageContract) {
    message
      .subject('Tarantulas to feed today')
      .from('admin@tarantulabox.net')
      .to(this.user.email)
      .htmlView('mail/reminder', { tarantulas: this.tarantulas })
  }
}
