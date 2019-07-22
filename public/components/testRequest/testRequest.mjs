import { dom, html } from '/include/mjs/templateUtils.mjs'
import { hello } from '/queries.mjs'

customElements.define(
  'test-request',
  class extends HTMLElement {
    connectedCallback() {
      this.appendChild(
        dom(
          html`
            <input @name="name" type="text" />
            <button #click="${this.hello.bind(this)}">
              Make API Request
            </button>
            <pre @name="result"></pre>
          `,
          this
        )
      )
    }

    async hello() {
      this.result.textContent = JSON.stringify(
        await hello(this.name.value),
        null,
        2
      )
    }
  }
)
