export async function fetchGql(query) {
  return await fetchJson('/graphql', {
    body: JSON.stringify({ query }),
    headers: {
      'content-type': 'application/json'
    },
    method: 'POST'
  })
}

export async function fetchJson(url, options) {
  const fetchFunc = options.fetch || fetch
  const response = await fetchFunc(url, options)
  return await response.json()
}

export async function fetchText(url, options) {
  const fetchFunc = options.fetch || fetch
  const response = await fetchFunc(url, options)
  return await response.text()
}

export default {
  fetchGql,
  fetchJson,
  fetchText
}
