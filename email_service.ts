import * as ns from 'node-schedule'
import { spawn } from 'child_process'

const rule = new ns.RecurrenceRule()
rule.hour = new ns.Range(6, 18)
rule.minute = 0
rule.second = 0

ns.scheduleJob(rule, () => {
  spawn('node', ['ace', 'send:reminder'])
})
