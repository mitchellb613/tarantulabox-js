import { BaseCommand } from '@adonisjs/core/build/standalone'
import User from 'App/Models/User'
import { DateTime } from 'luxon'

export default class SendReminder extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'send:reminder'

  /**
   * Command description is displayed in the "help" output
   */
  public static description = ''

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command. Don't forget to call `node ace generate:manifest`
     * afterwards.
     */
    loadApp: true,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process. Don't forget to call
     * `node ace generate:manifest` afterwards.
     */
    stayAlive: false,
  }

  public async run() {
    // Get users to remind
    const users = await User.query().where('notify', true)
    for (const user of users) {
      //get tarantulas
      const tarantulas = await user
        .related('tarantulas')
        .query()
        .where('next_feed_date', '<', DateTime.now().plus({ days: 1 }).startOf('day').toSQL())
      if (tarantulas.length < 1) {
        continue
      }
      console.log(`Send email to ${user.email}`)
    }
  }
}
