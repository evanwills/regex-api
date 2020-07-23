// ===============================================
// START: Enums

export enum ERequestType {
  test,
  match,
  replace,
  getConfig
}
export enum EResponseType {
  test,
  match,
  replace,
  config,
  error
}

export enum ERegexErrorType {
  delimiter,
  modifier,
  pattern
}

//  END:  Enums
// ===============================================
// START: Extendable interfaces

export interface IApiResponse {
  // Whether or not the request was OK or not
  ok: boolean,
  // Code for response export interface success/error export interface
  code: number,
  // List of results for test of each supplied regex
  content: [string | IRegexError | ITestResponse | IMatchResponse | IReplaceResponse] | string | UIconfig,
  // Human readable description of success/error export interface
  message: string,
  // Type of content contained in the "content" property
  type: EResponseType
}

//  END:  Extendable interfaces
// ===============================================
// START: Types



export interface IDelimiters {
  open: string,
  close: string,
}

export interface IRegex {
  id: number,
  // Regular expression pattern (without delimiters or modifiers
  pattern: string,
  // Regular expression modifiers
  modifiers: string,
  // Regular expression
  delimiters: IDelimiters
}

export interface IRegexMatchReplace extends IRegex {
  id: number,
  pattern: string,
  modifiers: string,
  delimiters: IDelimiters,
  // Replacement string/pattern
  replace: string,
  // Whether or not to transform white space escape sequences into their normal white space character equivalents
  transformWhiteSpace: boolean
}

export interface IMatchConfig {
  // The maximum number of characters a captured sub-pattern can be before it is truncated
  maxSubMatchLen: number,
  // The maximum number of characters the whole matched pattern can be before it is truncated
  maxWholeMatchLen: number,
  // The maximum number of characters the returned sample should be.
  maxReturnSampleLen: number
}



// -----------------------------------------------
// START: Request export interfaces



export interface IAPItestRequest {
  type: ERequestType,
  // List of regexes to be tested for validity
  regexes: [IRegex]
}

export interface IAPIreplaceRequest extends IAPItestRequest {
  type: ERequestType,
  // List of regexes to apply to sample strings
  regexes: [IRegexMatchReplace],
  // List of sample strings to which regexes are to be applied
  samplestrings: [string]
}

export interface IAPImatchRequest extends IAPIreplaceRequest {
  type: ERequestType,
  regexes: [IRegexMatchReplace],
  samplestrings: [string]
  // Whether or not to apply find/replace sequentially on strings or to apply find/replace to fresh version of original string
  chainRegexes: boolean,
  // Control how much text is returned for each match
  matchConfig: IMatchConfig
}



//  END:  Request export interfaces
// -----------------------------------------------
// START: Response export interfaces


/**
 * IAPIerrorResponse is only for bad requests or server errors
 */
export interface IApiErrorResponse extends IApiResponse {
  // Whether or not the request was OK or not
  ok: false,
  // Code for response export interface success/error export interface
  code: number,
  // Error message
  content: [string],
  // Human readable description of success/error export interface
  message: string,
  // Whether or not contents objects include timings for processing of regexes
  hasTiming: false,
  // "Type of content contained in the "content" property"
  type: EResponseType // should alwayse be "error"
}

export interface IApiTestResponse extends IApiResponse {
  // Whether or not the request was OK or not
  ok: true,
  // Code for response export interface success/error export interface
  code: number,
  // List of results for test of each supplied regex
  content: [ITestResponse],
  // Human readable description of success/error export interface
  message: string,
  // Whether or not contents objects include timings for processing of regexes
  hasTiming: false, // probably always be FALSE
  // Type of content contained in the "content" property
  type: EResponseType // should alwayse be "test"
}

export interface IApiMatchResponse extends IApiResponse {
  ok: true,
  code: number,
  content: [IMatchResponse],
  message: string,
  // Whether or not contents objects include timings for processing of regexes
  hasTiming: boolean,
  // Type of content contained in the "content" property
  type: EResponseType // should alwayse be "match"
}

export interface IApiReplaceResponse extends IApiResponse {
  ok: true,
  code: number,
  content: [IReplaceResponse],
  message: string,
  // Whether or not contents objects include timings for processing of regexes
  hasTiming: boolean, // should always be FALSE
  // Type of content contained in the "content" property
  type: EResponseType // should alwayse be "replace"
}

export interface IApiConfigResponse extends IApiResponse {
  ok: true,
  code: number,
  content: UIconfig,
  message: string,
  // Whether or not contents objects include timings for processing of regexes
  hasTiming: false, // should always be FALSE
  // Type of content contained in the "content" property
  type: EResponseType // should alwayse be "config"
}


// - - - - - - - - - - - - - - - - - - - - - - - -
// START: Response sub-type interfaces


export interface IMatchParts {
  key: string | number,
  value: string
}

export interface IResponseCapturedMatches {
  wholeMatch: string,
  parts: [IMatchParts],
}

export interface IRegexError {
  // If there's an issue within the regex pattern. badCharacter is the character at which the issue starts
  badCharacter: string,
  // Message delimiters errors
  delimiterError: string,
  // Message for modifiers errors
  modifierError: string,
  // If there's an issue within the regex pattern. offset is the index of the character at which the issue starts
  offset: number,
  // Message for pattern errors
  patternError: string,
  // Raw error message generated by regex engine
  rawMessage: string,
}

export interface IResponseRegex {
  id: number,
  // Whether or not the regex (as a whole) was valid
  isValid: boolean,
  // Details about errors in regex
  error: IRegexError
}


export interface ITestResponse {
  regex: IResponseRegex
}

export interface IMatchResponse extends ITestResponse {
  regex: IResponseRegex,
  // List of matches for a given regex & supplied strings
  matches: [IResponseCapturedMatches],
  // number of miliseconds the matching took the engine to execute (if available for that engine/platform)
  duration: number
}

export interface IReplaceResponse {
  // List of supplied transformed sample strings, modified by supplied regexes
  transformedSamples: [ITransformedSample],
}

export interface ITransformedSample {
  sample: [string],
  duration: number
}


// UIconfig provides basic config details for the API client to use
// to ensure its requests aren't rejected by the server.
export interface UIconfig {
  regex: {
    // The modifiers allowed by the server/API
    modifiers: {
      default: string,
      allowed: [string]
    },

    // Which delimiters the server/API will allow.
    // e.g. If the API is used by a Content Management System or Survey
    //     engine and that system uses "%" and "{}" as delimiters in it's
    //     templating, then those characters could be omitted from the
    //     allowed delimters.
    delimiters: {
      single: [string],
      paired: [IDelimiters],
      default: IDelimiters
    },

    // Whether or not the "Find" and "Replace" fields in a new
    // `<regex-pair>` should custom element should be rendered as a
    // single line text input or a multi line textarea
    multiLine: boolean,

    // Whether or not the "Find" and "Replace" fields in a new
    // `<regex-pair>` custom element should be the full width of the
    // containing box
    fullWidth: boolean
  }
  sample: {
    // Should the sample be split into lots of little pieces?
    split: {
      // Whether or not splitting is allowed
      allow: boolean,

      // Whether or not the sample should be split by default
      do: boolean,

      // Character to split the sample on
      char: string
    }

    // Should the sample have its white space trimmed?
    trim: {
      // Whether or not trimming is allowed
      allow: boolean,

      // Whether or not the sample should be trimmed by default
      do: boolean,

      // Whether or not the sample should be trimmed before processing
      // starts
      before: boolean,

      // Whether or not the sample should be trimmed after processing
      // finishes
      after: boolean
    },

    // Line end characters differ across platforms. This allows line
    // end characters to be converted to whatever is desired by the user
    normaliseLineEnd: {
      // Whether or not normalising line end characters is allowed
      allow: boolean

      // Whether or not the sample's line end characters should be
      // normalised by default
      do: boolean,
      // Line end character(s) that should be used for line end
      char: string
    }
  },
  returned: {
    // When rendering the match results into visible white space labels
    showWhiteSpace: boolean,

    maxLength: {
      // Maximum number of characters the API will return for a whole match
      // [0 = unlimited (default: 300)]
      whole: IConfigMax,

      // Maximum number of characters the API will return for captured
      // sub-patterns.
      // [0 = unlimited (default: 300)]
      captured: IConfigMax,

      // The maximum number of characters returned with the response for
      // a given sample
      // [0 = unlimited (default: 0)]
      sample: IConfigMax
    }
  }

  // The following properties are optional because they may leak
  // information about the server/API that would enable an attacker
  // to more quickly DoS the API
  limit: {
    count: {
      // The maximum number of regex pairs the API will process on a
      // single request
      // [0 = unlimited (default: 0)]
      regex: Number,

      // The maximum number of sample strings the API will process on a
      // single request
      // [0 = unlimited (default: 0)]
      sample: Number,
    }

    maxLength: {
      // The maximum number of characters in a single regex string the
      // API will allow.
      // [0 = unlimited (default: 0)]
      singleRegex: Number,

      // The maximum number of characters in a single sample string the
      // API will allow.
      // [0 = unlimited (default: 0)]
      singleSample: Number,

      // The absolute total maximum characters the whole request JSON object
      // can be before it's rejected by the API
      // [0 = unlimited (default: 0)]
      totalSample: Number,

      // The absolute total maximum characters the whole request JSON object
      // can be before it's rejected by the API
      // [0 = unlimited (default: 0)]
      totalRequest: Number
    }
  }
}

export interface IConfigMax {
  max: number,
  default: number
}

//  END:  Response sub-type interfaces
// - - - - - - - - - - - - - - - - - - - - - - - -


//  END:  Response interfaces
// -----------------------------------------------



//  END:  Types
// ===============================================
// START: Scalars

//  END:  Scalars
// ===============================================
