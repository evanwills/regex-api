import {html, render} from './lit-html.js';


// // Define a template
// const myTemplate = (name) => html`<p>Hello ${name} chicken</p>`;

// // Render the template to the document
// render(myTemplate('World'), document.body);


export const ucFirst = (input) => {
  return input.charAt(0).toUpperCase() + input.slice(1);
}

export const htmlEscape = (input) => {
  const chars = [
    {find: '<', replace: '&lt;'},
    {find: '>', replace: '&gt;'},
    {find: '"', replace: '&#34;'},
    {find: "'", replace: '&#39;'}
  ]
}

const deletePairBtn = (id) => {
  const _id = `pair${id}-delete`
  // <span class="sr-only">(${id})</span>
  return html`
    <button id=${_id} class="pair-delete">
      Delete this pair
    </button>
  `
}

const addPairBtn = (id, suffix) => {
  const _suffix = (suffix === 'before') ? 'before' : 'after'
  const _id = `pair${id}-add--${_suffix}`
  const _class = 'pair-add pair-add--' + _suffix

  // <span class="sr-only">(${id})</span>
  return html`
    <button id=${_id} class=${_class}>
      Add pair ${_suffix}
    </button>
  `
}

const wholeChecboxInput = (id, isChecked, suffix, label) => {
  const _isChecked = (typeof isChecked === 'boolean' && isChecked === true)
  return html`
    <label class="pair-${suffix} wrapping-label">
      <input type="checkbox" value="true" id="pair${id}-whiteSpace" ?checked=${_isChecked} />
      ${label}
    </label>
  `
}

const fieldLabel = (id, name) => {
  const _class = `pair-${name} pair-${name}--label`
  const _label = ucFirst(name)

  return html`<label class=${_class} for=${id}>${_label}</label>`
}

const singleLineInput = (id, value, subType, pattern) => {
  // let label = ucFirst(subType)
  let name = subType
  let place = 'Regex'
  const _pattern = (typeof pattern === 'string' && pattern !== '') ? pattern : ''
  const _value = (typeof value === 'string' && value !== '') ? htmlEscape(value) : ''
  console.log('id', id)
  console.log('value', value)
  console.log('subType', subType)
  console.log('pattern', pattern)

  switch(subType) {
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
  }
  const _id = 'pair' + id + '-' + name
  const _class = `pair-${name} pair-${name}--input`

  return html`
    ${fieldLabel(_id, name)}
    <input type="text" id=${_id} class=${_class} .value=${_value} placeholder=${place} ?pattern=${_pattern} />
  `;

}

const multiLineInput = (id, value, subType) => {
  const name = (subType === 'replace') ? 'replace' : 'find'
  // const label = ucFirst(name)
  const place = (name === 'find') ? 'Regex pattern' : 'Replacement pattern'
  const _id = 'pair' + id + '-' + name
  const _class = `pair-${name} pair-${name}--input`
  const _pattern = (typeof pattern === 'string' && pattern !== '') ? pattern : ''
  const _value = (typeof pattern === 'string' && pattern !== '') ? htmlEscape(value) : ''

  return html`
    ${fieldLabel(_id, name)}
    <textarea id=${_id} class=${_class} placeholder=${place} ?pattern=${_pattern}>${_value}</textarea>
  `;
}

/**
 *
 * @param {number} id
 * @param {string} find
 * @param {string} replace
 * @param {string} modifiers
 * @param {boolean} transform
 * @param {string} openDelim
 * @param {string} closeDelim
 * @param {boolean} fullWidth
 * @param {boolean} multiLine
 * @param {boolean} hasSiblings
 */
export const wholeRegexPair = (data) => {
  console.log('data:', data)
  const _id = data.id
  const _wrapperClass = (data.fullWidth === true) ? 'regex-pair regex-pair--full-width' : 'regex-pair'
  const _getInput = (data.multiLine === true) ? multiLineInput : singleLineInput
  // const _find =
  // const _replace = _getInput(_id, data.replace, 'replace')
  // const _modifiers = singleLineInput(_id, data.modifiers, 'modifiers')
  const _settingsID = `pair${_id}--settings`
  const _legendID = `pair${_id}--settings-legend`
  const _deleteBtn = (data.hasSiblings === true) ? deletePairBtn(_id) : ''

  // ${_modifiers}
  return html`
    <article class=${_wrapperClass}>
      <h1>Pair ${_id}</h1>
      <div class="pair-inputs">
        ${_getInput(_id, data.find, 'find')}
        ${singleLineInput(_id, data.modifiers, 'modifiers', '^[igsm]+$')}
        ${_getInput(_id, data.replace, 'replace')}
      </div>
      <div class="settings" role="group" aria-labeldby=${_settingsID}>
        <h2 id=${_settingsID}>Settings</h2>
        <div class="pair-settings" role="group" aria-labeldby="${_legendID}">
          ${wholeChecboxInput(_id, data.transformWS, 'transformWS', 'Transform white space escape sequences in replace')}
          <div class="pair-delimiters">
            <h3 id="pair${_id}-delimiters-label">Delimiters</h3>
            <ul role="group" aria-labeledby="pair${_id}-delimiters-label">
              <li>${singleLineInput(_id, data.openDelim, 'open', '^[^\\w\\d]$')}</li>
              <li>${singleLineInput(_id, data.closeDelim, 'close', '^[^\\w\\d]$')}</li>
            </ul>
          </div>
          <div class="pair-layout">
            <h3 id="pair${_id}-layout">Layout</h3>
            <ul role="group" aria-labelledby="pair${_id}-layout">
              <li>${wholeChecboxInput(_id, data.fullWidth, 'fullWidth', 'Full width')}</li>
              <li>${wholeChecboxInput(_id, data.multiLine, 'multiLine', 'Multi-line')}</li>
            </ul>
          </div>
        </div>
        ${addPairBtn(_id, 'before')}
        ${_deleteBtn}
      </div>
      ${addPairBtn(_id, 'after')}
    </article>
  `
}

const data = {
  id: 1,
  find: '',
  replace: '',
  modifiers: '',
  openDelim: '',
  closeDelim: '',
  transformWS: true,
  fullWidth: true,
  multiLine: true,
  hasSiblings: true
}

render(
  wholeRegexPair(data),
  document.body
)
