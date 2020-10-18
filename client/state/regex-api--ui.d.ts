import {
  ID,
  IDelimiters,
  IRegexMatchReplace,
  ResponseCapturedMatches,
  RegexError,
  EngineListingItem,
  UserEngineDefaults,
  EngineConfig
} from './regex-api'

import {
  TemplateResult
} from 'node_modules\lit-html\ts3.4\lib\template-result.d.ts'

// ===============================================
// START: Enums


//  END:  Enums
// ===============================================
// START: Scalars

//  END:  Scalars
// ===============================================
// START: Interfaces

export interface CheckboxInputData {
  id: string,
  label: string,
  isChecked: boolean,
  prefix?: string,
  suffix?: string
}

export interface LabelInputData {
  id: string,
  label: string,
  field: TemplateResult
}

export interface PositiveIntData {
  id: string,
  value: number,
  max?: number
}
export interface sampleSettings {
  splitSample: boolean,
  splitDelimiter: string,
  trimSample: boolean,
  trimBefore: boolean,
  trimAfter: boolean
}

export interface Sample {
  settings: sampleSettings,
  samples: string[]
}

export interface TruncateLength {
  sample: number,
  wholeMatch: number,
  subPattern: number
}

export interface ResultSettings {
  truncateLong: TruncateLength,
  showWhiteSpace: boolean
}

export interface UImatchResponse {
  // List of matches for a given regex & supplied strings
  matches: [ResponseCapturedMatches],
  // number of miliseconds the matching took the engine to execute
  // (if available for that engine/platform)
  duration: number
}

export interface UIResults {
  settings: ResultSettings,
}

export interface Settings {
  availableEngines: [EngineListingItem],
  engineConfig: {
    engine: EngineConfig,
    userOverrides: [UserEngineDefaults]
  }
}

export interface UiRegex extends IRegexMatchReplace {
  id: ID
  pattern: string,
  modifiers: string,
  delimiters: IDelimiters,
  // Replacement string/pattern
  replace: string,
  // Whether or not to transform white space escape sequences into
  // their normal white space character equivalents
  transformWhiteSpace: boolean,
  hasError: boolean,
  awaitingTest: boolean,
  error?: RegexError | null,
  fullWidth: boolean,
  multiLine: boolean
}

export interface UIregexes {
  settings: UserEngineConfig,
  chainRegexes: boolean,
  regexes: UiRegex[]
}

export interface ClientUiState {
  sample: Sample,
  regexes: UIregexes,
  results: UImatchResponse[],
  output: string,
  messages: string[],
  engineDefaults: UserEngineConfig[]
}

export redux

//  END:  Interfaces
// ===============================================


