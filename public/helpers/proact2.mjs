const domFunctions = []
const REFLECTED_PROP_TYPES = ['boolean', 'number', 'string']

export function defineElement(elementName, cb) {
  const funcString = cb.toString()
  const funcStringThin = funcString.replace(/\s+/g, ' ')
  const propList = funcStringThin.match(/^\(\s?\{(.*?)\}[,\s)]/s)
  const template = funcString.match(/return \w{0,}`(.*)`/s)[1].trim()
  const varMatches = template.match(/\$\{.*?\}/g)
  let props = []

  if (propList) {
    props = propList[1]
      .trim()
      .split(/,[\s]?/)
      .map(p => p.trim())
  }

  customElements.define(
    elementName,
    class extends HTMLElement {
      constructor() {
        super()
        this._rendered = false
        this._varCache = []
        this._varList = []

        varMatches.forEach(v => {
          this._varList.push(v.replace(/[${}]/g, ''))
        })

        props.forEach(prop => {
          const propParts = prop.match(/^(\w+).*?(?:=(.*))?$/)
          let [, propName, propValue] = propParts
          const attrName = toAttrName(propName)

          if (propValue) {
            propValue = eval(propValue.trim())
          }

          Reflect.defineProperty(this, propName, {
            get() {
              return this[`_${propName}`]
            },
            set(value) {
              this[`_${propName}`] = value

              if (REFLECTED_PROP_TYPES.includes(typeof value)) {
                if (typeof value === 'boolean') {
                  this.toggleAttribute(attrName, value)
                } else {
                  this.setAttribute(attrName, value)
                }
              }

              const varObj = this._varCache.find(v => v.name === propName)

              if (varObj) {
                varObj.props.forEach(({ el, name, template }) => {
                  el[name] = this._replaceTemplate(template)
                })

                varObj.textNodes.forEach(({ node, template }) => {
                  node.textContent = this._replaceTemplate(template)
                })
              }
            }
          })

          this[propName] = this.getAttribute(attrName) || propValue
        })
      }

      connectedCallback() {
        if (!this._rendered) {
          const propObj = Reflect.ownKeys(this).reduce((acc, cur) => {
            return cur.startsWith('_') ? acc : { ...acc, [cur]: this[cur] || '' }
          }, {})

          this.appendChild(
            this._dom(cb(propObj, { html: this._html.bind(this), update: this.update.bind(this) }))
          )
          this._checkTextNodes()

          this._rendered = true
        }
      }

      update(propName, value) {
        if (Reflect.has(this, propName)) {
          this[propName] = value
          return value
        }
      }

      _checkTextNodes(el = this) {
        [...el.childNodes].forEach(child => {
          if (child.nodeName === '#text') {
            this._varCache.forEach(varObj => {
              if (varObj.ids.some(id => child.textContent.includes(id))) {
                varObj.textNodes.push({ node: child, template: child.textContent })
              }
            })

            child.textContent = this._replaceTemplate(child.textContent)
          }

          if (child.firstChild) {
            this._checkTextNodes(child)
          }
        })
      }

      _convertAttributes(element) {
        [...element.attributes].forEach(attr => {
          if (/^on/.test(attr.name)) {
            const currentFunc = domFunctions.find(({ id }) => id === attr.value)

            element.addEventListener(attr.name.substr(2), currentFunc.value)
            element.removeAttribute(attr.name)
            domFunctions.splice(domFunctions.indexOf(currentFunc), 1)
          } else if (this._varCache.find(v => v.ids.some(id => attr.value.includes(id)))) {
            const varObjs = this._varCache.filter(
              v => Array.isArray(v.ids) && v.ids.some(id => attr.value.includes(id))
            )

            varObjs.forEach(varObj => {
              varObj.props.push({
                el: element,
                name: toPropName(attr.name),
                template: attr.value
              })
            })

            attr.value = this._replaceTemplate(attr.value)
          }
        })
        ;[...element.children].forEach(child => {
          this._convertAttributes(child)
        })
      }

      _dom(htmlString) {
        const template = document.createElement('template')
        template.innerHTML = htmlString
        const elements = template.content

        ;[...elements.childNodes].forEach(child => {
          if (child instanceof HTMLElement) {
            this._convertAttributes(child)
          }
        })

        return elements
      }

      _html(htmlArr, ...strings) {
        return htmlArr.reduce((acc, cur, i) => {
          let currentString = strings[i] || strings[i] === 0 ? strings[i] : ''

          if (Reflect.has(this, this._varList[i])) {
            const currentVarObj = this._varCache.find(v => v.name === this._varList[i])
            const id = generateId()

            if (currentVarObj) {
              currentVarObj.ids.push(id)
            } else {
              this._varCache.push({
                ids: [id],
                initialValue: currentString,
                name: this._varList[i],
                props: [],
                textNodes: []
              })
            }

            currentString = id
          }

          if (typeof currentString === 'object') {
            if (Array.isArray(currentString)) {
              currentString = currentString.join('')
            } else {
              currentString = JSON.stringify(currentString)
            }
          } else if (typeof currentString === 'function') {
            const id = generateId()

            domFunctions.push({ id, value: currentString })
            currentString = id
          }

          return `${acc}${cur}${currentString}`
        }, '')
      }

      _replaceTemplate(template) {
        let finalValue = template

        this._varCache.forEach(({ ids, name }) => {
          if (ids.some(id => template.includes(id))) {
            ids.forEach(id => {
              finalValue = finalValue.replace(new RegExp(id, 'g'), this[name])
            })
          }
        })

        return finalValue
      }
    }
  )
}

function generateId() {
  return Math.random()
    .toString(36)
    .substr(2, 9)
}

function toAttrName(str) {
  return str.replace(/([A-Z])/g, val => `-${val.toLowerCase()}`)
}

function toPropName(str) {
  return str.replace(/(-[a-z])/g, val => val.toUpperCase().replace('-', ''))
}

export default {
  defineElement
}
