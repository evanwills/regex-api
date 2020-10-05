import { html } from '../lit-html.js'
import { isNumeric } from './regex-api--utils.module.js'

/**
 *
 * @param {ResponseCapturedMatches} capturedMatches
 *
 * @returns {html}
 */
export const singleMatch = (capturedMatches) => {
  const parts = []

  // Check if we have any named captured sub-patterns
  for (let a = 0; a < capturedMatches.parts.length; a += 1) {
    const b = a + 1

    if (typeof capturedMatches.parts[b] !== 'undefined') {
      const partA = capturedMatches.parts[a]
      const partB = capturedMatches.parts[b]

      if (partA.value === partB.value) {
        // Some regex engines allow for named captured sub-patterns
        // We don't need to show the same captured sub-pattern twice
        // so we'll append the numeric index to the named key
        let numericKey = partA.key
        let stringKey = partB.key

        if (isNumeric(stringKey)) {
          numericKey = partB.key
          stringKey = partA.key
        }
        parts.push({
          key: html`${numericKey} <span class="named-pattern">${stringKey}</span>`,
          value: partA.value
        })

        // We've just merged the current item with the next item
        // Push the counter along, so in the next iteration, we
        // process the item after next
        a = b

        // move on to the next iteration
        continue
      }
    }

    // If we're here, we did't have a named captured sup-pattern to
    // deal with. Just add the current sub-pattern to the list as is
    parts.push(capturedMatches.parts[a])
  }

  return html`
    <dl class="captured-matches">
      <dt>Whole</dt>
      <dd>${capturedMatches.wholeMatch}</dd>

      ${parts.parts.map(part => html`
        <dt>${part.key}</dt>
        <dd>${part.value}</dd>
      `)}
    </dl>
  `
}
