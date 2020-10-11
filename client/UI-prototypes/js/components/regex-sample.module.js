import { html } from '../lit-html.js'
import { labeledInput, positiveIntInput, wholeChecboxInput } from './regex-api--utils.module.js'

/**
 *
 * @param {sample} sample
 */
export const wholeSample = (sample, settings) => {
  return html`
    <label for="sample" class="sample-label">Sample</label>
    <textarea id="sample" class="sample-input">${sample.rawSample}</textarea>

    <div class="sample-settings">
      <div class="sample-settings--trim" role="group" aria-labelledby="sampleTrim">
        ${wholeChecboxInput('trim', 'Trim white space from sample', sample.trimSample, 'sample')}
        <ul class="setting-list setting-list--hide sample-settings--trim-options">
          <li class="setting-list__item">
            ${wholeChecboxInput('trim', 'Trim sample before processing', sample.trimBefore, 'sample', 'before')}
          </li>
          <li class="setting-list__item">
            ${wholeChecboxInput('trim', 'Trim sample after processing', sample.trimAfter, 'sample', 'after')}
          </li>
        </ul>
      </div>
      <div class="sample-settings--split" role="group" aria-labelledby="sampleSplit">
        ${wholeChecboxInput('split', 'Split the sample into pieces', sample.splitSample, 'sample')}
        <p class="setting-list sample-settings__value-wrap">
          ${labeledInput('sampleSplitvalue', 'Split sample on character', html`<input type="text" value="${sample.splitDelimiter}" class="low-chars low-chars--2" id="sampleSplitvalue" />`)}
        </p>
      </div>
    </div>
  `
}
