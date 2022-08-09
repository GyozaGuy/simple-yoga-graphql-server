import { customElement, html } from '/helpers/proact.mjs'

customElement('custom-button', ({ label, useState }) => {
  const [clickCount, setClickCount] = useState(0)

  function click() {
    setClickCount(clickCount + 1)
  }

  return html`
    <label>
      <button type="button" onclick="${click}">
        ${label}: ${clickCount}
      </button>
    </label>
  `
})
