const { ApolloServer } = require('apollo-server-express')
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core')

const typeDefinition = require('./schema')
const Query = require('./Resolvers/index.resolver')
const ActionResolver = require('./Resolvers/Action.resolver')
const ScheduleResolver = require('./Resolvers/Schedule.resolver')

function createGraphQLServer (httpServer) {
  const graphqlServer = new ApolloServer({ 
    typeDefs: typeDefinition, 
    resolvers: {  // resolvers 中使用的欄位要跟 schema.Query 的一致
      Query,
      Action: ActionResolver,
      Schedule: ScheduleResolver
    },
    context: {
    },
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
  })

  return graphqlServer
}

module.exports = createGraphQLServer
