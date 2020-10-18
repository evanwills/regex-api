
export interface PairAndIndex {
  pair: UiRegex,
  index: number,
  last: number,
  first: number
}

export interface PairUpdatePayload {
  field: string,
  value: string | boolean,
  error: string
}
