const cachedComponents = []

function dom(html) {
  const template = document.createElement('template')
  template.innerHTML = html
  return template.content
}

function generateId() {
  return Math.random()
    .toString(36)
    .substr(2, 9)
}

function checkStuff(elements, partIndex) {
  return [...elements].reduce((acc, cur) => {
    let htmlString = ''

    if (customElements.get(cur.nodeName.toLowerCase())) {
      if (!cachedComponents[partIndex]) {
        cachedComponents[partIndex] = {}
      }

      if (cachedComponents[partIndex][cur._proactId]) {
        console.log('restoring')
        htmlString = `<span id="temp${cachedComponents[partIndex][cur._proactId]}"></span>`
      } else {
        console.log('caching')
        const id = generateId()
        cur._proactId = id
        htmlString = `<span id="temp${id}"></span>`
        cachedComponents[partIndex][id] = cur
      }
    } else {
      cur.innerHTML = cur.children.length ? checkStuff(cur.children, partIndex) : cur.innerHTML
      htmlString = cur.outerHTML
    }

    return `${acc}${htmlString}`
  }, '')
}

export function html(arr1, ...arr2) {
  const finalHTML = arr1.reduce((acc, cur, partIndex) => {
    const htmlString = checkStuff(dom(arr2[partIndex] || '').children, partIndex)

    return `${acc}${cur}${htmlString}`
  }, '')

  const finalDom = dom(finalHTML)

  // Restore cached components if placeholders are found
  cachedComponents.forEach(componentList => {
    Object.entries(componentList).forEach(([id, comp]) => {
      const foundInDom = finalDom.querySelector(`span#temp${id}`)

      if (foundInDom) {
        foundInDom.replaceWith(comp)
      }
    })
  })

  return finalDom
}

export default {
  html
}
