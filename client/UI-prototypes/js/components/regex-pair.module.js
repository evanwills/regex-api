import { html } from '../lit-html.js'
import { ucFirst, htmlEscape, wholeChecboxInput } from './regex-api--utils.module.js'

/**
 * Get a "Delete this pair" button template
 *
 * @param {string,number} id ID of the regex pair
 *
 * @returns {html} lit-html function
 */
const deletePairBtn = (id) => {
  const _id = `pair${id}-delete`
  // <span class="sr-only">(${id})</span>
  return html`
    <button id=${_id} class="pair-btn pair-btn--delete">
      Delete this pair
    </button>
  `
}

/**
 * Get an "Add pair" button template
 *
 * @param {string,number} id ID of the regex pair
 * @param {string} suffix Either 'before' or 'after'
 *
 * @returns {html} lit-html function
 */
const addPairBtn = (id, suffix) => {
  const _suffix = (suffix === 'before') ? 'before' : 'after'
  const _id = `pair${id}-add--${_suffix}`
  const _class = 'pair-btn pair-btn--add pair-btn--add--' + _suffix

  // <span class="sr-only">(${id})</span>
  return html`
    <button id=${_id} class=${_class}>
      Add pair ${_suffix}
    </button>
  `
}

/**
 * Get a simple label field
 *
 * @param {string,number} id full HTML ID string
 * @param {string}        name name of the field
 *
 * @returns {html} lit-html function
 */
const fieldLabel = (id, name) => {
  const _class = 'pair-label pair-label--' + name
  const _label = ucFirst(name)

  return html`<label class=${_class} for=${id}>${_label}</label>`
}

/**
 * Get a whole text input field (including label) for a regex-pair
 * input field
 *
 * @param {number} id      UID for regex pair
 * @param {string} value   Value assigned to input field
 * @param {string} subType Which (regex-pair) type of field
 * @param {string} pattern Validation pattern
 *
 * @returns {html} lit-html function
 */
const singleLineInput = (id, value, subType, pattern) => {
  // let label = ucFirst(subType)
  let name = subType
  let place = 'Regex'
  let classExtra = ''
  const _pattern = (typeof pattern === 'string' && pattern !== '') ? pattern : ''
  const _value = (typeof value === 'string' && value !== '') ? htmlEscape(value) : ''

  switch (subType) {
    case 'replace':
      place = 'Replacement'
      break
    case 'modifiers':
      place = 'e.g. i'
      break
    case 'open':
    case 'close':
      place = ''
      name = subType + 'Delim'
      classExtra = 'low-chars low-chars--2 '
  }
  const _id = 'pair' + id + '-' + name
  const _class = `${classExtra}pair-input pair-input--${name}`

  return html`
    ${fieldLabel(_id, subType)}
    ${(_pattern !== '')
      ? html`<input type="text" id=${_id} class=${_class} .value=${_value} placeholder=${place} pattern=${_pattern} />`
      : html`<input type="text" id=${_id} class=${_class} .value=${_value} placeholder=${place} />`}
  `
}

/**
 * Get a whole text input field (including label) for a regex-pair
 * input field
 *
 * @param {number} id      UID for regex pair
 * @param {string} value   Value assigned to input field
 * @param {string} subType Which (regex-pair) type of field
 * @param {string} pattern Validation pattern
 *
 * @returns {html} lit-html function
 */
const multiLineInput = (id, value, subType, pattern) => {
  const name = (subType === 'replace') ? 'replace' : 'find'
  // const label = ucFirst(name)
  const place = (name === 'find') ? 'Regex pattern' : 'Replacement pattern'
  const _id = 'pair' + id + '-' + name
  const _class = `pair-input pair-input--${name}`
  const _pattern = (typeof pattern === 'string' && pattern !== '') ? pattern : ''
  const _value = (typeof value === 'string' && value !== '') ? htmlEscape(value) : ''

  return html`
    ${fieldLabel(_id, name)}
    ${(_pattern !== '')
      ? html`<textarea id=${_id} class=${_class} placeholder=${place} pattern=${_pattern}>${_value}</textarea>`
      : html`<textarea id=${_id} class=${_class} placeholder=${place}>${_value}</textarea>`
    }
  `
}

/**
 * Render a whole Regex Pair block
 *
 * @param {UiRegex} data All the data for a single regex pair
 */
export const wholeRegexPair = (data) => {
  const _id = data.id
  const _wrapperClass = (data.fullWidth === true) ? 'regex-pair regex-pair--full-width' : 'regex-pair regex-pair--column-width'
  const _getInput = (data.multiLine === true) ? multiLineInput : singleLineInput
  const _settingsID = `pair${_id}--settings`
  const _legendID = `pair${_id}--settings-legend`

  // Only show delimiters input if they are required by the Regex Engine
  const delim = (data.delim.required === true)
    ? html`
    <div class="pair-delimiters">
      <h3 id="pair${_id}-delimiters-label">IDelimiters</h3>
      <ul class="setting-list" role="group" aria-labeledby="pair${_id}-delimiters-label">
        <li class="setting-list__item">${singleLineInput(_id, data.delim.open, 'open', '^[^\\w\\d]$')}</li>
        <li class="setting-list__item">${singleLineInput(_id, data.delim.close, 'close', '^[^\\w\\d]$')}</li>
      </ul>
    </div>
    `
    : ''

  return html`
    <article class=${_wrapperClass}>
      <h1>Pair ${_id}</h1>
      <div class="pair-inputs">
        ${_getInput(_id, data.find, 'find')}
        ${singleLineInput(_id, data.modifiers, 'modifiers', '^[igsm]+$')}
        ${_getInput(_id, data.replace, 'replace')}
      </div>
      <div class="pair-settings--wrap" role="group" aria-labeldby=${_settingsID}>
        <h2 id=${_settingsID}>Settings</h2>
        <div class="pair-settings" role="group" aria-labeldby="${_legendID}">
          ${wholeChecboxInput(_id, 'Transform white space escape sequences in replace', data.transformWS, 'pair', 'transformWS')}
          ${delim}
          <div class="pair-layout">
            <h3 id="pair${_id}-layout">Layout</h3>
            <ul class="setting-list" role="group" aria-labelledby="pair${_id}-layout">
              <li class="setting-list__item">${wholeChecboxInput(_id, 'Full width', data.fullWidth, 'pair', 'fullWidth')}</li>
              <li class="setting-list__item">${wholeChecboxInput(_id, 'Multi-line', data.multiLine, 'pair', 'multiLine')}</li>
            </ul>
          </div>
        </div>
        ${(data.hasSiblings === true) ? deletePairBtn(_id) : ''}
        ${addPairBtn(_id, 'after')}
      </div>
      ${addPairBtn(_id, 'before')}
    </article>
  `
}

export const regexSettings = (data) => {

}

