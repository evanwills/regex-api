
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
  return input.charAt(0).toUpperCase() + input.slice(1);
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
    {find: '<', replace: '&lt;'},
    {find: '>', replace: '&gt;'},
    {find: '"', replace: '&#34;'},
    {find: "'", replace: '&#39;'}
  ]
  if (typeof input !== 'string') {
    throw Error('htmlEscape() expects only parameter "input" to be a string. ' + typeof input + ' given.')
  }
  let output = input;
  for (let a = 0; a < chars.length; a += 1) {
    output = output.replace(chars[a].find, chars[a].replace)
  }
  return output
}
