import { DateTime } from 'luxon'
import ReminderEmailfrom 'App/Mailers/ReminderEmail'

public async run () {
  // Get users to remind
  const users = await User.query()
    .where('next_reminder_time', <=, DateTime.now().set({minute: 0, second: 0, millisecond: 0}).toSQL())
  // Send out emails
  for (const user of users) {
    await new ReminderEmail(user).send()
    // Set 'reminder_sent_at' so it repeats
    user.next_reminder_time = DateTime.now().plus({days: user.ReminderIntervalDays})
    await user.save()
  }
}