import { html } from '../lit-html.js'
import { ucFirst, htmlEscape } from './regex-api--utils.module.js'


/**
 * Get a checkbox field wrapped in a label.
 *
 * @param {string,number} id ID of the regex pair
 * @param {boolean}       isChecked Whether or not the checkbox
 * @param {string}        label
 * @param {string}        suffix
 *
 * @returns {html} lit-html function
 */
const wholeChecboxInput = (id, isChecked, label, suffix) => {
  const _isChecked = (typeof isChecked === 'boolean' && isChecked === true)
  const _class = `sample-${suffix} wrapping-label`
  const _suffix = (typeof suffix === 'string') ? '--' + suffix : ''
  const _id = `sample-${id}` + _suffix

  return html`
    <label class=${_class}>
      <input type="checkbox" value="true" id=${_id} ?checked=${_isChecked} value="true" />
      ${label}
    </label>
  `
}

/**
 *
 * @param {sample} sample
 */
export const wholeSample = (sample) => {
  return html`
    <label for="sample" class="sample-label">Sample</label>
    <textarea id="sample" class="sample-input">${sample.rawSample}</textarea>

    <div class="sample-settings">
      <div class="sample-settings--trim" role="group" aria-labelledby="sampleTrim">
        ${wholeChecboxInput('trim', sample.trimSample, 'Trim white space from sample')}
        <ul class="setting-list setting-list--hide sample-settings--trim-options">
          <li class="setting-list__item">
            ${wholeChecboxInput('trim', sample.trimBefore, 'Trim sample before processing', 'before')}
          </li>
          <li class="setting-list__item">
            ${wholeChecboxInput('trim', sample.trimAfter, 'Trim sample after processing', 'after')}
          </li>
        </ul>
      </div>
      <div class="sample-settings--split" role="group" aria-labelledby="sampleSplit">
        ${wholeChecboxInput('split', sample.splitSample, 'Split the sample into pieces')}
        <p class="setting-list sample-settings--split-splitter">
          <label for="sampleSplitChar">Split sample on character:</label>
          <input type="text" value="${htmlEscape(sample.splitDelimiter)}" class="two-char-input sample-settings--split--char" />
        </p>
      </div>
    </div>
  `
}
