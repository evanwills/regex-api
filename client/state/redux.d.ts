

export enum RegexPairUploadFields {
  id,
  pattern,
  replace,
  modifiers,
  open,
  close,
  transformWhiteSpace,
  hasError,
  error,
  fullWidth,
  multiLine,
  awaitingTest
}

export interface PairAndIndex {
  pair: UiRegex,
  index: number,
  last: number,
  first: number
}

export interface PairUpdatePayload {
  field: RegexPairUploadFields,
  value: string | boolean,
  error: string
}
