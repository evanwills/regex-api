// import { IRegexMatchReplace } from "./regex-api"
import { ClientUiState, UiRegex } from "./regex-api--ui"

const defaultState : ClientUiState = {
  sample: {
    settings: {
      splitSample: false,
      splitDelimiter: '\n',
      trimSample: true,
      trimBefore: true,
      trimAfter: false,
    },
    samples: []
  },
  regexes: {
    settings: {
      id: 'es',
      label: 'Pure EcmaScript',
      delimiter: {
        open: '',
        close: ''
      },
      modifiers: '',
      sample: {
        split: {
          doSplit: false,
          splitChar: ''
        },
        trim: {
          before: false,
          after: false,
        }
      },
      showWhiteSpace: true,
      truncateReturned: {
        maxCaptured: 300,
        maxWhole: 300,
        maxReturnSampleLenght: 300
      }
    },
    chainRegexes: true,
    regexes: []
  },
  results: [],
  output: '',
  messages: [],
  engineDefaults: []
}

const defaultRegex : UiRegex  = {
  id: '',
  pattern: '',
  replace: '',
  modifiers: 'i',
  delimiters: {
    open: '`',
    close: '`'
  },
  transformWhiteSpace: true,
  awaitingTest: false,
  hasError: false,
  error: null,
  fullWidth: false,
  multiLine: false
}

const defaultRegexError = {
  autoRepaired: false,
  type: '',
  message: '',
  badChar: '',
  offset: 0,
  rawMessage: ''
}
