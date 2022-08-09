export let html

export function Component(componentName) {
  return class extends HTMLElement {
    constructor() {
      super()

      this._eventListeners = {}
      // Store initial attribute values
      this._initialPropValues = Object.keys(this.reflectedProperties).reduce((acc, cur) => {
        const attrName = toAttrName(cur)

        if (this.hasAttribute(attrName)) {
          return { ...acc, [cur]: this.getAttribute(attrName) || 'true' }
        }

        return acc
      }, {})
      this._props = {}
      this._rendered = false
      this._uniqueContextKey = Symbol('uniqueContextKey')
      this.useShadow = true

      html = htmlTag.bind(this)
    }

    connected() {}

    connectedCallback() {
      if (!this._rendered) {
        if (this.useShadow) {
          this.root = this.attachShadow({ mode: 'open' })
        } else {
          this.root = this
        }

        // Set up component properties
        if (typeof this.properties === 'object' && !Array.isArray(this.properties)) {
          Object.entries(this.properties).forEach(([propName, propValue]) => {
            Object.defineProperty(this, propName, {
              get() {
                return this._props[propName]
              },
              set(value) {
                if (typeof value === typeof propValue) {
                  this._props[propName] = value

                  // Update the component when properties change
                  if (this._rendered) {
                    this.render()
                  }

                  if (Object.keys(this.reflectedProperties).includes(propName)) {
                    if (typeof value === 'boolean') {
                      if (value) {
                        this.setAttribute(toAttrName(propName), '')
                      } else {
                        this.removeAttribute(toAttrName(propName))
                      }
                    } else {
                      this.setAttribute(toAttrName(propName), value)
                    }
                  }
                } else {
                  throw new TypeError(`Invalid type "${typeof value}" for property "${propName}"!`)
                }
              }
            })

            this[propName] = propValue
          })

          // Set properties to initial attribute values
          Object.entries(this._initialPropValues).forEach(([propName, value]) => {
            const currentPropValue = this[propName]
            let attrValue = value

            if (typeof currentPropValue === 'number') {
              attrValue = Number(value)
            } else if (typeof currentPropValue === 'boolean') {
              attrValue = value.toLowerCase() === 'true'
            }

            this[propName] = attrValue
          })
        }

        if (this.template) {
          if (this.template instanceof DocumentFragment) {
            this.root.appendChild(this.template)
          } else {
            this.root.innerHTML = this.template
          }
        } else {
          this.render()
        }

        this._rendered = true

        this.connected()
      }
    }

    disconnected() {}

    disconnectedCallback() {
      this.disconnected()
    }

    clearEvents() {
      if (Array.isArray(this._eventListeners[this._uniqueContextKey])) {
        this._eventListeners[this._uniqueContextKey].forEach(remover => {
          remover()
        })
      }

      delete this._eventListeners[this._uniqueContextKey]
    }

    emitEvent(eventName, detail, options = {}) {
      this.dispatchEvent(
        new CustomEvent(eventName, {
          ...{
            bubbles: true,
            composed: true
          },
          options,
          detail
        })
      )
    }

    onEvent(eventName, callback, options = {}) {
      if (!this._eventListeners[this._uniqueContextKey]) {
        this._eventListeners[this._uniqueContextKey] = []
      }

      const cb = event => callback({ data: event.detail, event })

      this.addEventListener(eventName, cb, options)
      this._eventListeners[this._uniqueContextKey].push(() =>
        this.removeEventListener(eventName, cb, options)
      )
    }

    render() {
      [...this.template.children].forEach(child => {
        const { nodeName } = child
        const componentName = child.getAttribute('component')

        if (
          !this.useShadow &&
          nodeName === 'STYLE' &&
          componentName &&
          !document.head.querySelector(`[component=${componentName}]`)
        ) {
          document.head.appendChild(child)
        }
      })
      ;[...this.template.children].forEach((child, i) => {
        if (this.root.children[i]) {
          this.root.children[i].replaceWith(child)
        } else {
          this.root.appendChild(child)
        }
      })

      return this.template
    }

    select(selector) {
      return this.querySelector(selector)
    }

    selectAll(selector) {
      return this.querySelectorAll(selector)
    }

    static get _componentName() {
      return componentName
    }

    static get reflectedProperties() {
      if (typeof this.properties === 'object' && !Array.isArray(this.properties)) {
        return Object.entries(this.properties).reduce((acc, cur) => {
          const [key, value] = cur
          return typeof value !== 'object' ? { ...acc, [key]: value } : acc
        }, {})
      }

      return []
    }

    get properties() {
      return this.constructor.properties
    }

    get reflectedProperties() {
      return this.constructor.reflectedProperties
    }

    get template() {
      return this._template || ''
    }

    set template(template) {
      this._template = template
    }
  }
}

export function defineElement(elementClass) {
  if (elementClass && customElements && !customElements.get(elementClass._componentName)) {
    customElements.define(elementClass._componentName, elementClass)
  }
}

const domFunctions = {}

function convertAttributes(element, context) {
  [...element.attributes].forEach(attr => {
    if (context && attr.name === '@name') {
      context[attr.value] = element
      element.removeAttribute(attr.name)
    } else if (/^#/.test(attr.name)) {
      element.addEventListener(attr.name.substr(1), domFunctions[attr.value])
      element.removeAttribute(attr.name)
      delete domFunctions[attr.value]
    }
  })
  ;[...element.children].forEach(child => {
    convertAttributes(child, context)
  })
}

function htmlTag(htmlArr, ...strings) {
  const htmlString = htmlArr.reduce((acc, cur, i) => {
    let currentString = strings[i] || strings[i] === 0 ? strings[i] : ''

    if (typeof currentString === 'object') {
      if (Array.isArray(currentString)) {
        currentString = currentString.join('')
      } else {
        currentString = JSON.stringify(currentString)
      }
    } else if (typeof currentString === 'function') {
      const id = Math.random()
        .toString(36)
        .substr(2, 9)

      domFunctions[id] = currentString
      currentString = id
    }

    return `${acc}${cur}${currentString}`
  }, '')

  const template = document.createElement('template')
  template.innerHTML = htmlString
  const elements = template.content

  ;[...elements.children].forEach(child => {
    convertAttributes(child, this)
  })

  return elements
}

function toAttrName(str) {
  return str.replace(/([A-Z])/g, val => `-${val.toLowerCase()}`)
}

export default {
  Component,
  defineElement,
  html
}
