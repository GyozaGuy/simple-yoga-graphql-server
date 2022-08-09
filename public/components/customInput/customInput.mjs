import { customElement, html } from '/helpers/proact.mjs'

customElement('custom-input', ({ useState, value = '' }) => {
  const [text, setText] = useState(value)

  return html`
    <input oninput="${({ target: { value } }) => setText(value)}" type="text" value="${text}" />
    <strong>${text}</strong>
  `
})
