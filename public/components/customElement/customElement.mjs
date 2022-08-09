import { customElement, html } from '/helpers/proact.mjs'

customElement('custom-element', ({ children, initialCount = 0, useState }) => {
  const [count, setCount] = useState(Number(initialCount))
  const [count2, setCount2] = useState(20)

  function increment() {
    setCount(count + 1)
  }

  function increment2() {
    setCount2(count2 + 10)
  }

  return html`
    <button onclick="${increment}" type="button">${count}</button>
    <button onclick="${increment2}" type="button">${count2}</button>
    ${children}
  `
})
