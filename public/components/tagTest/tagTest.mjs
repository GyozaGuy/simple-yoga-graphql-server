import { html } from '/helpers/taggedTemplateTest.mjs'
import '/components/customInput/customInput.mjs'

const renderButton = document.body.querySelector('#renderButton')
const resultsDiv = document.body.querySelector('#results')
const input = `
  <strong>
    <custom-input value="this is the value"></custom-input>
  </strong>
  <i>
    <div>
      <custom-input value="this is the second value"></custom-input>
    </div>
  </i>
`

render()

renderButton.addEventListener('click', render)

function render() {
  while (resultsDiv.firstChild) {
    resultsDiv.firstChild.remove()
  }

  resultsDiv.appendChild(html`
    <custom-input></custom-input>
    <div>Hi</div>
    ${input}
  `)
}
