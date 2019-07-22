import fetch from 'node-fetch'
import { fetchJson } from '../public/helpers/fetchHelper.mjs'

export default {
  Pokemon: {
    stats: ({ stats }, { types }) =>
      types.map(t => stats.find(s => s.name === t))
  },
  Query: {
    hello: (_, { name }) => `Hello ${name || 'World'}`,
    async pokemon(_, { name }) {
      const {
        base_experience: xp,
        height,
        name: pokemonName,
        order,
        sprites,
        stats,
        weight
      } = await fetchJson(`https://pokeapi.co/api/v2/pokemon/${name}`, {
        fetch
      })

      return {
        height,
        name: pokemonName,
        order,
        picture: sprites.front_default,
        stats: stats.map(s => ({
          name: s.stat.name,
          value: s.base_stat
        })),
        weight,
        xp
      }
    },
    async swCharacters(_, { name }) {
      const characters = await fetchJson(
        `https://swapi.co/api/people?search=${name}`,
        { fetch }
      )

      return characters.results.map(c => ({ name: c.name }))
    }
  }
}
