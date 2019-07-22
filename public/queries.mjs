import { fetchGql } from '/helpers/fetchHelper.mjs'

export async function hello(name) {
  return await fetchGql(`
    {
      hello(name: "${name}")
    }
  `)
}

export async function pokemon(name, stats = []) {
  return await fetchGql(`
    {
      pokemon(name: "${name}") {
        height
        name
        order
        picture
        stats(types: ${JSON.stringify(stats)}) {
          name
          value
        }
        weight
        xp
      }
    }
  `)
}

export async function starWarsCharacters(name) {
  return await fetchGql(`
    {
      swCharacters(name: "${name}") {
        name
      }
    }
  `)
}

export default {
  hello,
  pokemon,
  starWarsCharacters
}
