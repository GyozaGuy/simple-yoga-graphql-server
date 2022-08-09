import { customElement, html } from '/helpers/proact.mjs'

customElement('custom-card', ({ children, useState }) => {
  const [count, setCount] = useState(0)
  const [showChildren, setShowChildren] = useState(false)

  return html`
    <style>
      .container {
        background-color: #ecebea;
        border-radius: 4px;
        box-shadow: 0 2px 4px #000;
        color: #000;
        padding: 10px;
      }
      .container button {
        box-shadow: 0 2px 4px #000;
      }
      .container button:active {
        box-shadow: inset 0 2px 4px #000;
      }
    </style>
    <section class="container">
      <button type="button" onclick="${() => setCount(count + 1)}">
        Increment
      </button>
      <button type="button" onclick="${() => setShowChildren(!showChildren)}">
        ${showChildren ? 'Hide' : 'Show'} Children
      </button>
      ${count > 0 &&
        `<div>
        Count: ${count}
      </div>`}
      ${showChildren &&
        `<div>
        ${children}
      </div>`}
    </section>
  `
})
