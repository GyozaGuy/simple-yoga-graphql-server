import yoga from 'graphql-yoga'
import typeDefs from './typeDefs.mjs'
import resolvers from './resolvers.mjs'

const { GraphQLServer } = yoga
const server = new GraphQLServer({ typeDefs, resolvers })

server.start(() => console.log('Server is running on localhost:4000'))
