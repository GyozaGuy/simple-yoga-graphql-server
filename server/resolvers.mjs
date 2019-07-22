import fetch from 'node-fetch'
import { fetchJson } from '../public/helpers/fetchHelper.mjs'

const cache = {
  pokemon: {}
}

export default {
  Pokemon: {
    stats: ({ stats }, { types }) =>
      types.map(t => stats.find(s => s.name === t))
  },
  Query: {
    hello: (_, { name }) => `Hello ${name || 'World'}`,
    async pokemon(_, { name }) {
      if (cache.pokemon[name]) {
        return cache.pokemon[name]
      } else {
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
        const pokemon = {
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

        cache.pokemon[name] = pokemon // eslint-disable-line require-atomic-updates

        return pokemon
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
