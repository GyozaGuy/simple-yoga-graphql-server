import yoga from 'graphql-yoga'
import express from 'express'
import typeDefs from './typeDefs.mjs'
import resolvers from './resolvers.mjs'
import pagesRouter from './routes/pages.mjs'
import apiRouter from './routes/api.mjs'

const { static: expressStatic } = express
const { GraphQLServer } = yoga

const server = new GraphQLServer({ typeDefs, resolvers })

server.express.use((_req, res, next) => {
  res.pageData = {
    config: {}
  }

  next()
})

server.express.use('/', pagesRouter)
server.express.use('/api', apiRouter)

server.express.set('view engine', 'ejs')
server.express.use(expressStatic('public'))

const serverOptions = {
  endpoint: '/graphql',
  playground: '/playground',
  port: 4000
}

server.start(serverOptions, ({ port }) =>
  console.log(`Server is running on localhost:${port}`)
)
