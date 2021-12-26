const express = require('express')
const http = require('http')
const GraphqlServer = require('./grapgql/graphqlServer')

const app = express()
const server = http.createServer(app)

const PORT = 8091

app.use(express.json({ limit: 1024 * 1024 * 1024 }))
app.use(express.urlencoded({ extended: true }))

initNormal()

function initNormal () {
  app.use((req, res, next) => {
    // req.ws = ws
    next()
  })

  // NOTE: 這裡要用 server，不能用 app，不然 websocket 會失效
  server.listen(PORT, async () => {
    const graphqlServer = await GraphqlServer(server)
    await graphqlServer.start()
    graphqlServer.applyMiddleware({
      app: app,
      path: '/api/graphql',
    })

    console.log(`Http server listening on port ${PORT} in \x1b[31m${process.env.NODE_ENV}\x1b[0m mode`)
  })
}
