import { dom, html } from '/include/mjs/templateUtils.mjs'
import { hello, pokemon, starWarsCharacters } from '/queries.mjs'

customElements.define(
  'test-request',
  class extends HTMLElement {
    connectedCallback() {
      this.appendChild(
        dom(
          html`
            <input
              @name="helloName"
              placeholder="Name (optional)"
              type="text"
            />
            <button #click="${this.sayHello.bind(this)}">
              Say hello
            </button>

            <pre @name="helloResult"></pre>
            <input @name="charName" placeholder="Search" type="text" />
            <button #click="${this.getCharacters.bind(this)}">
              Get characters
            </button>
            <pre @name="charResult"></pre>

            <input @name="pokeName" placeholder="Name" type="text" />
            <label>
              <input type="checkbox" value="attack" checked /> Attack
            </label>
            <label>
              <input type="checkbox" value="defense" checked /> Defense
            </label>
            <label><input type="checkbox" value="hp" checked /> Health</label>
            <label>
              <input type="checkbox" value="special-attack" checked /> Special
              attack
            </label>
            <label>
              <input type="checkbox" value="special-defense" checked /> Special
              Defense
            </label>
            <label><input type="checkbox" value="speed" checked /> Speed</label>
            <button #click="${this.getPokemon.bind(this)}">
              Get Pokémon
            </button>
            <pre @name="pokeResult"></pre>
            <div @name="pokeImageWrapper"></div>
          `,
          this
        )
      )
    }

    async getCharacters() {
      this.charResult.textContent = JSON.stringify(
        await starWarsCharacters(this.charName.value),
        null,
        2
      )
    }

    async getPokemon() {
      const stats = [...this.querySelectorAll('input[type="checkbox"]')]
        .map(cb => (cb.checked ? cb.value : null))
        .filter(s => s)
      const result = await pokemon(this.pokeName.value, stats)
      const { name, picture } = result.data.pokemon

      this.pokeResult.textContent = JSON.stringify(result, null, 2)

      if (picture) {
        this.pokeImageWrapper.innerHTML = html`
          <img alt="${name}" src="${picture}" />
        `
      }
    }

    async sayHello() {
      this.helloResult.textContent = JSON.stringify(
        await hello(this.helloName.value),
        null,
        2
      )
    }
  }
)
