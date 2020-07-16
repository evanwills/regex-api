
// ===============================================
// START: Enums

export enum requestMode {
  test,
  match,
  replace
}

export enum regexErrorType {
  delimiter,
  modifier,
  pattern
}

//  END:  Enums
// ===============================================
// START: Scalars

export type ID = string;

//  END:  Scalars
// ===============================================
// START: Interfaces

export interface IapiResponse {
  // Whether or not the request was OK or not
  ok: boolean,
  // Code for response export interface success/error export interface
  code: number,
  // List of results for test of each supplied regex
  content?: [TestResponse | MatchResponse | ReplaceResponse] | EngineConfig,
  // Human readable description of success/error export interface
  message: string
}

//  END:  Interfaces
// ===============================================
// START: Types

export interface Delimiters {
  open: string,
  close: string,
}

export interface Regex {
  id: ID,
  // Regular expression pattern (without delimiters or modifiers
  pattern: string,
  // Regular expression modifiers
  modifiers: string,
  // Regular expression
  delimiters: Delimiters
}

export interface RegexMatchReplace extends Regex {
  id: ID
  pattern: string,
  modifiers: string,
  delimiters: Delimiters,
  // Replacement string/pattern
  replace: string,
  // Whether or not to transform white space escape sequences into
  // their normal white space character equivalents
  TransformWhiteSpace: boolean
}

export interface MatchConfig {
  // The maximum number of characters a captured sub-pattern can be
  // before it is truncated
  maxSubMatchLen: number,
  // The maximum number of characters the whole matched pattern can
  // be before it is truncated
  maxWholeMatchLen: number
}



// -----------------------------------------------
// START: Request export interfaces



export interface APItestRequest {
  type: requestMode,
  // List of regexes to be tested for validity
  regexes: [Regex]
}

export interface APIreplaceRequest extends APItestRequest {
  type: requestMode,
  // List of regexes to apply to sample strings
  regexes: [RegexMatchReplace],
  // List of sample strings to which regexes are to be applied
  samplestrings: [string]
}

export interface APImatchRequest extends APIreplaceRequest {
  type: requestMode,
  regexes: [RegexMatchReplace],
  samplestrings: [string],
  // Whether or not to apply find/replace sequentially on strings or
  // to apply find/replace to fresh version of original string
  chainRegexes: boolean,
  // Control how much text is returned for each match
  matchConfig: MatchConfig
}



//  END:  Request export interfaces
// -----------------------------------------------
// START: Response export interfaces




export interface APIinvalidRequestResponse extends IapiResponse {
  // Whether or not the request was OK or not
  ok: false,
  // Code for response export interface success/error export interface
  code: number,
  // Error message
  // content: [],
  // Human readable description of success/error export interface
  message: string
}

export interface APIconfigResponse extends IapiResponse {
  // Whether or not the request was OK or not
  ok: true,
  // Code for response export interface success/error export interface
  code: number,
  // Engine config parameters
  content: EngineConfig,
  // Human readable description of success/error export interface
  message: string
}

export interface APItestResponse extends IapiResponse {
  // Whether or not the request was OK or not
  ok: true,
  // Code for response export interface success/error export interface
  code: number,
  // List of results for test of each supplied regex
  content: [TestResponse],
  // Human readable description of success/error export interface
  message: string
}

export interface APImatchResponse extends IapiResponse {
  ok: true,
  code: number,
  content: [MatchResponse],
  message: string,
  // Whether or not contents objects include timings for processing
  // of regexes
  hasTiming: boolean
}

export interface APIreplaceResponse extends IapiResponse {
  ok: true,
  code: number,
  content: [ReplaceResponse],
  message: string,
  // Whether or not contents objects include timings for processing
  // of regexes
  hasTiming: boolean
}

// - - - - - - - - - - - - - - - - - - - - - - - -
// START: Response sub-export interfaces

export interface MatchParts {
  key: string | number,
  value: string
}

export interface ResponseCapturedMatches {
  wholeMatch: string,
  parts: [MatchParts],
}

export interface RegexError {
  // Whether or not the engine was able to fix the error
  autoRepair: boolean,
  // Which part of the regex does this error relate to
  type: regexErrorType,
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
}

export interface ResponseRegex {
  id: ID,
  // Whether or not the regex (as a whole) was valid
  isValid: boolean,
  // Details about errors in regex
  error: [RegexError]
}


export interface TestResponse {
  regex: ResponseRegex
}

export interface MatchResponse extends TestResponse {
  regex: ResponseRegex,
  // List of matches for a given regex & supplied strings
  matches: [ResponseCapturedMatches],
  // number of miliseconds the matching took the engine to execute
  // (if available for that engine/platform)
  duration: number
}

export interface ReplaceResponse {
  // List of supplied sample strings, transformed by supplied regexes
  transformedSamples: [TransformedSample]
}

export interface TransformedSample {
  sample: string,
  duration: number
}

//  END:  Response sub-export interfaces
// - - - - - - - - - - - - - - - - - - - - - - - -

export interface EngineConfig {
  modifiers: [string],
  delimiters: {
    single: [string],
    paired: [Delimiters]
  },
  maxPart: Number,
  maxWhole: Number,
  maxRegexes?: Number,
  maxSamples?: Number,
  maxSampleLength?: Number,
  maxTotalSampleLength?: Number,
  maxReturnSampleLength?: Number
}

//  END:  Response export interfaces
// -----------------------------------------------

//  END:  Types
// ===============================================
