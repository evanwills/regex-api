import { html } from '../lit-html.js'
import { labeledInput, positiveIntInput, wholeChecboxInput } from './regex-api--utils.module.js'

export const resultSettings = (settings) => {
  return html`
  <div role="group" aria-labeldby="matchResultSettings">
    <h2 id="matchResultSettings">Match result settings</h2>
    <div class="sample-settings">
      <ul>
        <li>${labeledInput('truncateSample', 'Maximum number of characters before sample is truncated (0 = unlimited)', positiveIntInput('truncateSample', settings.truncateLong.sample, 1000))}</li>

        <li>${labeledInput('truncateWhole', 'Maximum number of characters before whole match is truncated (0 = unlimited)', positiveIntInput('truncateSample', settings.truncateLong.wholeMatch, 1000))}</li>

        <li>${labeledInput('truncateSample', 'Maximum number of characters before captured sub-pattern is truncated (0 = unlimited)', positiveIntInput('truncateSample', settings.truncateLong.partMatch, 1000))}</li>
        <li>${wholeChecboxInput('showWhiteSpace', 'Show whitespace in matched patterns', settings.showWhiteSpace)}</li>
        <li></li>
      </ul>
    </div>
  </div>`
}
