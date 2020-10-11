import {
  ID,
  Delimiters,
  RegexMatchReplace,
  RegexError,
  EngineListingItem,
  UserEngineDefaults
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

export interface Sample {
  splitSample: boolean,
  splitDelimiter: string,
  trimSample: boolean,
  trimBefore: boolean,
  trimAfter: boolean,
  samples: [string]
}

export interface TruncateLength {
  sample: number,
  wholeMatch: number,
  partMatch: number
}

export interface Settings {
  truncateLong: TruncateLength,
  showWhiteSpace: boolean,
  availableEngines: [EngineListingItem],
  engineConfig: {
    engine: EngineConfig,
    user: UserEngineDefaults
  }
}

export interface UiRegex extends RegexMatchReplace {
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
