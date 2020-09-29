import {html, render} from './lit-html.js';
import {wholeRegexPair} from './components/regex-pair.module.js'

// // Define a template
// const myTemplate = (name) => html`<p>Hello ${name} chicken</p>`;

// // Render the template to the document
// render(myTemplate('World'), document.body);



const data1 = {
  id: 1,
  find: '',
  replace: '',
  modifiers: 'i',
  delim: {
    open: '',
    close: '',
    required: false
  },
  transformWS: true,
  fullWidth: true,
  multiLine: true,
  hasSiblings: true
}
const data2 = {
  id: 2,
  find: '^[a-z]+',
  replace: '0',
  modifiers: 'i',
  delim: {
    open: '`',
    close: '`',
    required: true
  },
  transformWS: true,
  fullWidth: false,
  multiLine: false,
  hasSiblings: true
}

render(
  html`${wholeRegexPair(data1)}${wholeRegexPair(data2)}`,
  document.body
)
