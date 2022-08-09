import { customElement, html } from '/helpers/proactTemplateTest.mjs'

customElement('template-test', ({ useState }) => {
  const [num, setNum] = useState(0)
  const [test, setTest] = useState('blah')

  return html`
    <div>
      Does it work? {{num}} {{test}} {{num}}
      <button onclick="${() => setNum(num + 1)}" type="button">Increment</button>
    </div>
  `
})

const string = 'this is a <strong>string</strong> with a part: {{content}}'

document.body.appendChild(dom(string))

const last = document.body.lastChild

if (last.nodeName === '#text') {
  const toReplace = last.textContent.match(/\{\{\w+\}\}/g)

  toReplace.forEach(str => {
    last.textContent = last.textContent.replace(new RegExp(str, 'g'), '')

    const newNode = document.createTextNode(str)
    const test = last.parentNode.insertBefore(newNode, last.nextSibling)

    test.textContent = 'the content has been replaced!'
  })
}

function dom(htmlString) {
  const template = document.createElement('template')

  template.innerHTML = htmlString
  return template.content
}
