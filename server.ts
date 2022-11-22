/*
|--------------------------------------------------------------------------
| AdonisJs Server
|--------------------------------------------------------------------------
|
| The contents in this file is meant to bootstrap the AdonisJs application
| and start the HTTP server to accept incoming connections. You must avoid
| making this file dirty and instead make use of `lifecycle hooks` provided
| by AdonisJs service providers for custom code.
|
*/

import 'reflect-metadata'
import sourceMapSupport from 'source-map-support'
import { Ignitor } from '@adonisjs/core/build/standalone'
import * as https from 'https'
import * as fs from 'fs'

sourceMapSupport.install({ handleUncaughtExceptions: false })

const privateKey = fs.readFileSync('tls/server.key', 'utf8')
const certificate = fs.readFileSync('tls/server.crt', 'utf8')

new Ignitor(__dirname).httpServer().start((handle) => {
  return https.createServer({ key: privateKey, cert: certificate }, handle)
})
