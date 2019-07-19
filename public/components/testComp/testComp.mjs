import { dom, html } from '/include/mjs/templateUtils.mjs'
import { fetchGql } from '/helpers/fetchHelper.mjs'

customElements.define(
  'test-comp',
  class extends HTMLElement {
    connectedCallback() {
      this.appendChild(
        dom(
          html`
            <input @name="name" type="text" />
            <button #click="${this.apiRequest.bind(this)}">
              Make API Request
            </button>
            <pre @name="payload"></pre>
          `,
          this
        )
      )
    }

    async apiRequest() {
      this.payload.textContent = JSON.stringify(
        await fetchGql(`{hello(name: "${this.name.value || ''}")}`),
        null,
        2
      )
    }
  }
)
