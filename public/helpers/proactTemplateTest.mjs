const REFLECTED_PROP_TYPES = ['boolean', 'number', 'string']
const RESERVED_PROP_NAMES = ['children', 'render', 'template', 'useState']

const domFunctions = []

function convertAttributes(element, context) {
  [...element.attributes].forEach(attr => {
    if (context && attr.name === '@name') {
      context[attr.value] = element
      element.removeAttribute(attr.name)
    } else if (/^on/.test(attr.name)) {
      element.addEventListener(attr.name.substr(2), domFunctions[attr.value])
      element.removeAttribute(attr.name)
      delete domFunctions[attr.value]
    }
  })
  ;[...element.children].forEach(child => {
    convertAttributes(child, context)
  })
}

export function customElement(name, cb, useShadow = false) {
  const propEls = []

  customElements.define(
    name,
    class extends HTMLElement {
      constructor() {
        super()

        if (useShadow) {
          this.root = this.attachShadow({ mode: 'open' })
        } else {
          this.root = this
        }

        // Set initial state
        this._children = this.innerHTML
        this._props = {}
        this._rendered = false
        this._state = []
        this.stateIndex = 0
      }

      connectedCallback() {
        if (!this._rendered) {
          // Set up properties
          [...this.attributes].forEach(attr => {
            const { name, value } = attr
            const propName = toPropName(name)

            if (RESERVED_PROP_NAMES.includes(propName)) {
              throw new Error('Cannot use reserved prop names!')
            }

            Object.defineProperty(this, propName, {
              get() {
                return this._props[propName]
              },
              set(newValue) {
                if (typeof newValue === typeof value) {
                  this._props[propName] = newValue

                  if (this._rendered) {
                    // this.render()
                  }

                  if (REFLECTED_PROP_TYPES.includes(typeof newValue)) {
                    if (typeof newValue === 'boolean') {
                      this.toggleAttribute(name, newValue)
                    } else {
                      this.setAttribute(name, newValue)
                    }
                  }
                } else {
                  throw new TypeError(
                    `Invalid type "${typeof newValue}" for property "${propName}"`
                  )
                }
              }
            })

            this[propName] = value
          })

          // Remove children
          while (this.root.firstChild) {
            this.root.firstChild.remove()
          }

          // Render component
          this.root.appendChild(this.template)
          this._rendered = true
        }
      }

      render() {
        const template = this.template

        ;[...template.children].forEach((child, i) => {
          const comparedChild = this.root.children[i]

          if (comparedChild) {
            if (
              comparedChild.nodeName &&
              customElements.get(comparedChild.nodeName.toLowerCase()) &&
              typeof comparedChild.render === 'function'
            ) {
              comparedChild.stateIndex = 0
              comparedChild.render()
            } else {
              comparedChild.replaceWith(child)
            }
          }
        })
      }

      useState(initialValue) {
        const currentIndex = this.stateIndex
        const value = this._state[currentIndex] != null ? this._state[currentIndex] : initialValue

        this._state[currentIndex] = value
        this.stateIndex++

        return [
          value,
          newValue => {
            this._state[currentIndex] = newValue
            this.stateIndex = 0
            // this.render()
          }
        ]
      }

      get template() {
        let templateHTML = cb({
          ...this._props,
          children: this._children,
          useState: this.useState.bind(this)
        })

        templateHTML.match(/\{\{\w+\}\}/g).forEach((match, i) => {
          const id = generateId()
          const propName = match.replace(/[{}]/g, '')
          templateHTML = templateHTML.replace(
            match,
            `<span data-prop-id="${id}">${this._state[i]}</span>`
          )
          propEls.push({ id, propName })
        })

        return domFromHTML(templateHTML)
      }
    }
  )
}

function domFromHTML(htmlString) {
  const template = document.createElement('template')
  template.innerHTML = htmlString
  const elements = template.content

  ;[...elements.childNodes].forEach(child => {
    if (child instanceof HTMLElement) {
      convertAttributes(child, this)
    }
  })

  return elements
}

function generateId() {
  return Math.random()
    .toString(36)
    .substr(2, 9)
}

export function html(htmlArr, ...strings) {
  return htmlArr.reduce((acc, cur, i) => {
    let currentString = strings[i] || strings[i] === 0 ? strings[i] : ''

    if (typeof currentString === 'object') {
      if (Array.isArray(currentString)) {
        currentString = currentString.join('')
      } else {
        currentString = JSON.stringify(currentString)
      }
    } else if (typeof currentString === 'function') {
      const id = generateId()

      domFunctions[id] = currentString
      currentString = id
    }

    return `${acc}${cur}${currentString}`
  }, '')
}

function toPropName(attrName) {
  return attrName.replace(/(-[a-z])/g, v => v.toUpperCase().replace('-', ''))
}

export default {
  customElement,
  html
}
