import { fetchGql } from '/helpers/fetchHelper.mjs'

export async function hello(name) {
  return await fetchGql(`{hello(name: "${name}")}`)
}

export default {
  hello
}
