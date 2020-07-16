import { ID, Delimiters, RegexMatchReplace, RegexError } from './regex-api'
// ===============================================
// START: Enums


//  END:  Enums
// ===============================================
// START: Scalars

//  END:  Scalars
// ===============================================
// START: Interfaces

export interface sample {
  splitSample: boolean,
  splitDelimiter: string,
  trimSample: boolean,
  trimBefore: boolean,
  trimAfter: boolean,
  samples: [string]
}

export interface truncateLength {
  sample: number,
  wholeMatch: number,
  partMatch: number
}

export interface settings {
  truncateLong: truncateLength,
  showWhiteSpace: boolean
}

export interface uiRegex extends RegexMatchReplace {
  id: ID
  pattern: string,
  modifiers: string,
  delimiters: Delimiters,
  // Replacement string/pattern
  replace: string,
  // Whether or not to transform white space escape sequences into
  // their normal white space character equivalents
  TransformWhiteSpace: boolean,
  hasError: boolean,
  awaitingTest: boolean,
  error?: RegexError,
  fullWidth: boolean,
  multiLine: boolean
}

//  END:  Interfaces
// ===============================================
