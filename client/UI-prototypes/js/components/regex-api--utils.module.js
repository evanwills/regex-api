import { html } from '../lit-html.js'
/**
 * Make the first character of a string uppercase (if possible)
 *
 * @param {string} input
 *
 * @returns {string}
 */
export const ucFirst = (input) => {
  if (typeof input !== 'string') {
    throw Error('htmlEscape() expects only parameter "input" to be a string. ' + typeof input + ' given.')
  }
  return input.charAt(0).toUpperCase() + input.slice(1)
}

/**
 * Make HTML content safe for text input and textarea fields
 *
 * @param {string} input HTML content to be escaped
 *
 * @returns {string}
 */
export const htmlEscape = (input) => {
  const chars = [
    { find: '<', replace: '&lt;' },
    { find: '>', replace: '&gt;' },
    { find: '"', replace: '&#34;' },
    { find: "'", replace: '&#39;' }
  ]
  if (typeof input !== 'string') {
    throw Error('htmlEscape() expects only parameter "input" to be a string. ' + typeof input + ' given.')
  }
  let output = input
  for (let a = 0; a < chars.length; a += 1) {
    output = output.replace(chars[a].find, chars[a].replace)
  }
  return output
}

export const getCompanionWSChar = (char) => {
  const wsChars = [
    ['\\n', '\n'],
    ['\\r', '\r'],
    ['\\t', '\t']
  ]

  for (let a = 0; a < wsChars.length; a += 1) {
    if (char === wsChars[a][0]) {
      return wsChars[a][1]
    } else if (char === wsChars[a][1]) {
      return wsChars[a][0]
    }
  }

  return char
}

/**
 * Get an array of strings split by an escaped whitespace character
 *
 * @param {string} input
 * @param {string} splitter
 *
 * @returns {array} List of strings split by character
 */
export const explodeString = (input, splitter) => {
  return input.split(getCompanionWSChar(splitter))
}

/**
 * Trim white space from all strings in an array
 * @param {array} input
 */
export const trimAllStrings = (input) => {
  return input.map(str => str.trim())
}

/**
 * Take an array of strings and join them together separated by the
 * splitter
 *
 * @param {array} input
 * @param {string} splitter
 *
 * @returns {string} All items from input joined by splitter
 */
export const implodeString = (input, splitter) => {
  const _split = getCompanionWSChar(splitter)
  let _output = ''

  let _sep = ''
  for (let a = 0; a < input.length; a += 1) {
    _output += _sep + input[a]
    _sep = _split
  }

  return _output
}

/**
 * Test whether a string contains a number
 *
 * @param {string} input text to be tested
 *
 * @returns {boolean} TRUE if string can be converted to a number
 *                    FALSE otherwise
 */
export const isNumeric = (input) => (!isNaN(parseFloat(input)) && isFinite(input))

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
