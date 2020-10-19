import { AnyAction } from 'redux';
import { IRegexMatchReplace } from '../../state/regex-api'


export enum PairActionType {
  INSERT_BEFORE = 'REGEX_INSERT_BEFORE',
  INSERT_AFTER  = 'REGEX_INSERT_AFTER',
  DELETE        = 'REGEX_DELETE',
  UPDATE        = 'REGEX_UPDATE',
  MOVE_UP       = 'REGEX_MOVE_UP',
  MOVE_DOWN     = 'REGEX_MOVE_DOWN',
  DUD           = 'DUD'
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

export enum pairFields {
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
  index: number
}

export interface PairPayload {
  id: string,
  newID?: string,
  field?: pairFields,
  value?: string | boolean,
  error?: string
}

export interface PairUpdatePayload extends PairPayload {
  id: string,
  field: pairFields,
  value: string | boolean,
  error?: string
}

export interface PairInsertPayload extends PairPayload {
  id: string,
  newID: string
}

export interface PairAction extends AnyAction {
  type: PairActionType,
  payload: PairPayload
}

function isPairInsert(data : PairPayload) : data is PairInsertPayload {
  return (data as PairInsertPayload).newID !== undefined;
}

function isPairUpdate(data : PairPayload) : data is PairUpdatePayload {
  return ((data as PairInsertPayload).field !== undefined && (data as PairInsertPayload).value !== undefined);
}

export interface PairInsertAction extends PairAction {
  type: PairActionType,
  payload: PairInsertPayload
}

export interface PairUpdateAction extends PairAction {
  type: PairActionType,
  payload: PairUpdatePayload
}
