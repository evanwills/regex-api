import { Reducer } from 'redux'
import { isRegexError } from '../../state/regex-api';
import {
  UiRegex,
  PairAndIndex,
  PairPayload,
  PairInsertPayload,
  PairUpdatePayload,
  pairFields,
  PairActionType,
  PairAction,
  PairUpdateAction,
  PairInsertAction,
  isPairInsert,
  isPairUpdate
} from './regexPairs';

const defaultRegex : UiRegex  = {
  id: '',
  pattern: '',
  replace: '',
  modifiers: 'i',
  delimiters: {
    open: '',
    close: ''
  },
  transformWhiteSpace: true,
  hasError: false,
  error: null,
  fullWidth: false,
  multiLine: false,
  awaitingTest: false
}



/**
 * Get a modified clone of the regex pair that triggered the reducer
 * plus that pair's index in the list
 *
 * @param state Full list of regex pairs
 * @param id    ID of regex new pair is to be insert relative to
 */
const getPairAndInd = (state : UiRegex[], id: string, newID: string = '') : PairAndIndex | null => {
  const _reduce = (oldInd : PairAndIndex | null, _pair : UiRegex, _index : number) : PairAndIndex | null => {
    if (_pair.id === id) {
      const newPair : UiRegex = (newID !== '') ? { ..._pair, id: newID, pattern: '', replace: ''} : _pair
      return {
        pair: newPair,
        index: _index
      }
    } else {
      return null
    }
  }

  return state.reduce(
    _reduce,
    null
  )
}

/**
 * Insert a clone of the current pair before } the current pair
 *
 * @param state Full list of regex pairs
 * @param id    ID of regex new pair is to be insert relative to
 */
const insertPair = (state : UiRegex[], IDs: PairInsertPayload, before: boolean) => {
  const cloned : PairAndIndex | null = getPairAndInd(state, IDs.id, IDs.newID);

  if (cloned === null) {
    return state;
  }

  if (before && cloned.index === 0) {
    return [cloned.pair, ...state]
  } else if (!before && cloned.index === state.length - 1) {
    return [...state, cloned.pair]
  } else {
    const last = (before) ? (cloned.index - 1) : cloned.index
    const first = last - 1
    const _before = state.slice(0, last)
    const _after = state.slice(first)
    return [
      ..._before,
      cloned.pair,
      ..._after
    ]
  }
}

const updatePair = (pair : UiRegex, payload: PairUpdatePayload) => {
  const newPair = { ...pair }
  const field : string = payload.field as unknown as string;
  switch (typeof payload.value) {
    case 'string':
      switch (payload.field) {
        case pairFields.pattern:
          newPair.pattern = payload.value;
          break;
        case pairFields.replace:
          newPair.replace = payload.value;
          break;
        case pairFields.modifiers:
          newPair.modifiers = payload.value;
          break;
        // case pairFields.pattern:
        // case pairFields.replace:
        // case pairFields.modifiers:
        //   newPair[field] = payload.value; // TS doesn't like this pattern (bummer!)
        //   break;
        case pairFields.open:
          newPair.delimiters.open = payload.value;
          break;
        case pairFields.close:
          newPair.delimiters.close = payload.value;
          break;
      }
      break
    case 'boolean':
      switch (payload.field) {
        case pairFields.transformWhiteSpace:
          newPair.transformWhiteSpace = payload.value;
          break;
        case pairFields.hasError:
          newPair.hasError = payload.value;
          break;
        case pairFields.awaitingTest:
          newPair.awaitingTest = payload.value;
          break;
        case pairFields.fullWidth:
          newPair.fullWidth = payload.value;
          break;
        case pairFields.multiLine:
          newPair.multiLine = payload.value;
          break;
        // case pairFields.transformWhiteSpace:
        // case pairFields.hasError:
        // case pairFields.awaitingTest:
        // case pairFields.fullWidth:
        // case pairFields.multiLine:
        //   newPair[field] = payload.value; // TS doesn't like this pattern (bummer!)
        //   break;
      }
      break;
    case 'object':
      if (payload.field === pairFields.error && isRegexError(payload.value)) {
        newPair.error = payload.value
      }
  }

  return newPair
}

const movePair = (pairs: UiRegex[], id: string, up : boolean) : UiRegex[] => {
  const movePair = getPairAndInd(pairs, id);

  if (movePair === null ||
      (up === true && movePair.index === 0) ||
      (up === false && movePair.index === (pairs.length - 1))
  ) {
    return pairs
  } else {
    const last = (up === true) ? movePair.index - 2 : movePair.index
    const first = last + 1
    const oldPairs = pairs.filter(pair => pair.id !== id)
    const beforePairs = oldPairs.slice(0, last)
    const afterPairs = oldPairs.slice(first)
    return [...beforePairs, movePair.pair, ...afterPairs]
  }
}

export const regexPairsR = (state : UiRegex[] = [defaultRegex] , action: PairAction) : UiRegex[] => {
  switch(action.type) {
    case PairActionType.INSERT_BEFORE:
      if (isPairInsert(action.payload)) {
        return insertPair(state, action.payload, true);
      }
      break;

    case PairActionType.INSERT_AFTER:
      if (isPairInsert(action.payload)) {
        return insertPair(state, action.payload, false);
      }
      break;

    case PairActionType.MOVE_UP:
      return movePair(state, action.payload.id, true);

    case PairActionType.MOVE_DOWN:
      return movePair(state, action.payload.id, false);

    case PairActionType.UPDATE:
      return state.map((pair : UiRegex) : UiRegex => {
        if (pair.id === action.payload.id) {
          if (isPairUpdate(action.payload)) {
            return updatePair(pair, action.payload)
          }
        }
        return pair
      })

    case PairActionType.DELETE:
      if (state.length > 1) {
        return state.filter(pair => pair.id !== action.payload.id)
      }
  }
  return state
}
