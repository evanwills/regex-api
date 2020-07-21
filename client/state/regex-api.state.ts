const defaultState = {
  sample: {
    splitSample: false,
    splitDelimiter: '\n',
    trimSample: true,
    trimBefore: true,
    trimAfter: false,
    samples: []
  },
  regex: {
    chainRegexes: true,
    engine: {
      allowedDelimiters: {
        single: [],
        paired: []
      },
      allowedModifiers: [],
      engineName: 'ecmascript',
      isLocal: true,
      apiURL: '',
      defaultDelimiters: {
        open: '',
        close: ''
      },
      defaultModifiers: ''
    },
    regexes: []
  },
  settings: {
    truncateLong: {
      sample: 300,
      wholeMatche: 300,
      subPattern: 300
    },
    showWhiteSpace: true
  },
  results: [],
  output: '',
  messages: []
}

const defaultRegex = {
  id: '',
  find: '',
  replace: '',
  modifiers: 'i',
  delimiters: {
    open: '`',
    close: '`'
  },
  transformEscaped: true,
  hasError: false,
  error: {}
}

const defaultRegexError = {
  autoRepaired: false,
  type: '',
  message: '',
  badChar: '',
  offset: 0,
  rawMessage: ''
}
