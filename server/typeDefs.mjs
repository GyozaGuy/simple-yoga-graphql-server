export default `
  type Query {
    hello(name: String): String!
    pokemon(name: String!): Pokemon!
    swCharacters(name: String!): [Character!]
  }
  type Character {
    name: String!
  }
  type Pokemon {
    height: Int!
    name: String!
    order: Int!
    picture: String!
    stats(types: [String]): [PokemonStat!]
    weight: Int!
    xp: Int!
  }
  type PokemonStat {
    name: String!
    value: Int!
  }
`
