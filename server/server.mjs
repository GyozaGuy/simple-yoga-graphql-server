import yoga from 'graphql-yoga'
import express from 'express'
import cookieParser from 'cookie-parser'
import typeDefs from './typeDefs.mjs'
import resolvers from './resolvers.mjs'
import pagesRouter from './routes/pages.mjs'
import { createTableUnlessExists } from './sqliteHelper.mjs'

const { static: expressStatic } = express
const { GraphQLServer } = yoga

const server = new GraphQLServer({ typeDefs, resolvers })

createTableUnlessExists('users', {
  email: 'TEXT',
  id: 'TEXT',
  idToken: 'TEXT'
})

server.express.use((_req, res, next) => {
  res.pageData = {
    config: {},
    userInfo: null
  }

  next()
})

server.express.set('view engine', 'ejs')
server.express.use(expressStatic('public'))
server.express.use(cookieParser())

server.express.use('/', pagesRouter)

const serverOptions = {
  endpoint: '/graphql',
  playground: '/playground',
  port: 4000
}

server.start(serverOptions, ({ port }) =>
  console.log(`Server is running on localhost:${port}`)
)
