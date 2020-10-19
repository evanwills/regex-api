import { html } from 'lit-html'
/**
 * Get a checkbox field wrapped in a label.
 *
 * @param {string,number} id ID of the regex pair
 * @param {string}        label
 * @param {boolean}       isChecked Whether or not the checkbox
 * @param {string}        suffix
 *
 * @returns {html} lit-html function
 */
export const wholeChecboxInput = (id, label, isChecked, prefix, suffix) => {
  const _isChecked = (typeof isChecked === 'boolean' && isChecked === true)
  const _prefix = (typeof prefix === 'string') ? prefix : ''
  const _suffix = (typeof suffix === 'string') ? '-' + suffix : ''
  const _id = `${_prefix}${id}${_suffix}`
  const _class = `wrapping-label ${_prefix}${suffix}`

  return html`
    <label class=${_class}>
      <input type="checkbox" value="true" id=${_id} ?checked=${_isChecked} />
      ${label}
    </label>
  `
}

export const positiveIntInput = (id, value, max) => {
  const _max = (typeof max !== 'number') ? 1000 : max
  let _charCount = '2'
  if (_max > 9999) {
    _charCount = '5'
  } else if (_max > 999) {
    _charCount = '4'
  } else if (_max > 99) {
    _charCount = '3'
  }
  return html`
    <input type="number" id=${id} value=${value} min="0" max=${max} step=1 class="low-chars low-chars--${_charCount}" />
  `
}

/**
 * Get an input field and its associated label
 *
 * @param {string}         id    The ID for the field
 * @param {string}         label Label text for the field
 * @param {TemplateResult} field Input field itself
 *
 * @returns {TemplateResult}
 */
export const labeledInput = (id, label, field) => {
  return html`
    <label for=${id}>${label}</label>
    ${field}
  `
}
