import { html, render } from './lit-html.js';
import { wholeRegexPair } from './components/regex-pair.module.js'
import { wholeSample } from './components/regex-sample.module.js'
import { resultSettings } from './components/regex-result-settings.module.js'

// // Define a template
// const myTemplate = (name) => html`<p>Hello ${name} chicken</p>`;

// // Render the template to the document
// render(myTemplate('World'), document.body);

const data1 = {
  id: 1,
  find: '(?<=// )((?<firstWord>[^\\s]+)[^\\r\\n]+)(?=[\\r\\n]+)',
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

const sample = {
  splitSample: true,
  splitDelimiter: '\\n',
  trimSample: true,
  trimBefore: true,
  trimAfter: false,
  samples: [],
  rawSample: `export interface RegexError {
    // Whether or not the engine was able to fix the error
    autoRepair: boolean,
    // Which part of the regex does this error relate to
    type: ERegexErrorType,
    // Message about the given erorr
    // (cleaned up for user export interface)
    message: string
    // If there's an issue within the regex pattern.
    // badCharacter is the character at which the issue starts
    badCharacter: string,
    // If there's an issue within the regex pattern.
    // Offset is the index of the character at which the issue starts
    offset: number,
    // Raw error message generated by regex engine
    rawMessage: string,
  }`
}

const settings = {
  truncateLong: {
    sample: 300,
    wholeMatch: 300,
    partMatch: 200
  },
  showWhiteSpace: true
}

render(
  html`
    <section>
      <h1>Sample</h1>
      ${wholeSample(sample)}
    </section>
    ${wholeRegexPair(data1)}
    ${wholeRegexPair(data2)}
    ${resultSettings(settings)}

  `,
  document.body
)
// render(
//   wholeRegexPair(data2),
//   document.body
// )

// render(
//   wholeRegexPair(data1),
//   document.body
// )
