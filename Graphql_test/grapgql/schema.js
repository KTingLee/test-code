const { gql } = require('apollo-server-express')

const typeDefinition = gql`
  type Query {
    actions: [Action]
    schedules: [Schedule]
    schedule(id: Int!): Schedule
  }

  type Action {
    id: Int!
    title: String!
    type: String!
    date: String!
    start: String!
    end: String!
    weekday: String!
    schedule: Schedule!
    meta: String!
    updateTime: String!
  }

  type Schedule {
    id: Int!
    title: String!
    type: String!
    startDate: String!
    endDate: String!
    actions: [Action]
  }
`;

module.exports = typeDefinition