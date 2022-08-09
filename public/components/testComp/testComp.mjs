import { defineElement } from '/helpers/proact2.mjs'

defineElement(
  'test-comp',
  (
    {
      count = 1,
      testProp,
      testPropTwo = 'This is the default title!',
      testPropThree: alias,
      theThing = true
    },
    { html, update }
  ) => {
    function increment() {
      count = update('count', ++count)
      theThing = update('theThing', !theThing)
    }

    return html`
      <h1>${testProp}</h1>
      <div>
        testPropTwo: ${testPropTwo} ${2 ** 5}
      </div>
      <div>
        alias: ${alias}
      </div>
      <button type="button" onclick="${increment}">Increment! ${count}</button>
      <div>
        theThing: ${theThing} ${testProp}
      </div>
      <input
        oninput="${({ target: { value } }) => (testPropTwo = update('testPropTwo', value))}"
        placeholder="${count} ${testProp}"
        type="text"
        value="${testPropTwo}"
      />
    `
  }
)
