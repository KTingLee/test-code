import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'
import session from 'express-session'
import helmet from 'helmet'
import os from 'os'
import routes from './routes/index.route'

import error from './middlewares/errors/error'

const app = express()
const debug = require('debug')('protp:app')
const server = require('http').Server(app)
const pkg = require('./package.json')
const SQLiteStore = require('connect-sqlite3')(session)

const ws = require('socket.io')(server, {
  transports: ['websocket', 'polling'],
  pingInterval: 40000,
  pingTimeout: 25000
})

const db = require('./db.js')
const dbScript = require('./initDB')


debug(`[INIT] backend ver : \x1b[31m${pkg.gitVersion}\x1b[0m`)

if (os.platform() === 'linux') {
  initUnlicense()
} else {
  initNormal()
}

function initUnlicense () {
  app.listen(8090, async () => {
    debug('\x1b[31m=====> This device is un-licensed!!! <=====\x1b[0m')
  })
}

function initNormal() {
  app.use(cors())
  app.use(bodyParser.json({ limit: 1024 * 1024 * 1024 })) // 1G
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(helmet())

  app.use(session({
    secret: 'protp55688',
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 8 * 60 * 60 * 1000
    },
    store: new SQLiteStore(),
    resave: false,
    saveUninitialized: true
  }))

  app.use((req, res, next) => {
    req.ws = ws
    next()
  })

  app.use('/api', routes)

  app.use(error.converter)

  app.use(error.notFound)

  app.use(error.handler)

  // NOTE: 這裡要用 server，不能用 app，不然 websocket 會失效
  server.listen(8090, () => {
    initWS(ws)
  })
}

function initWS (ws) {
  setInterval(() => {
    let ret = {message: 'alive'}
    ws.emit('serverCondition', ret)
  }, 1000)
}

export default app
