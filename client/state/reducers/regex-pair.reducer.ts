import { Reducer } from 'redux'
import { isRegexError } from '../regex-api';
import { UiRegex } from '../regex-api--ui';
import { PairAndIndex, PairUpdatePayload } from '../redux'

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
const getPairAndInd = (state : UiRegex[], id: string, before: boolean) : PairAndIndex | null => {
  const _reduce = (oldInd : PairAndIndex | null, _pair : UiRegex, _index : number) : PairAndIndex | null => {
    if (_pair.id === id) {
      return {
        pair: { ..._pair, 'pattern': '', 'replace': ''},
        index: _index,
        last: (before) ? _index - 1 : _index,
        first: (before) ? _index : _index + 1
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
const insertNow = (state : UiRegex[], id: string, before: boolean) => {
  const source : PairAndIndex | null = getPairAndInd(state, id, before);

  if (source === null) {
    return state;
  }

  if (before && source.index === 0) {
    return [source.pair, ...state]
  } else if (!before && source.index === state.length - 1) {
    return [...state, source.pair]
  } else {
    const before = state.slice(0, source.last)
    const after = state.slice(source.first)
    return [
      ...before,
      source.pair,
      ...after
    ]
  }
}

const updatePair = (pair : UiRegex, payload: PairUpdatePayload) => {
  const newPair = { ...pair }
  switch (typeof payload.value) {
    case 'string':
      switch (payload.field) {
        case 'pattern':
          newPair.pattern = payload.value
          break;
        case 'replace':
          newPair.replace = payload.value
          break;
        case 'open':
          newPair.delimiters.open = payload.value
          break;
        case 'close':
          newPair.delimiters.close = payload.value
          break;
        case 'modifiers':
          newPair.modifiers = payload.value
          break;
      }
      break
    case 'boolean':
      switch (payload.field) {
        case 'transformWhiteSpace':
          newPair.transformWhiteSpace = payload.value
          break;
        case 'hasError':
          newPair.hasError = payload.value
          break;
        case 'awaitingTest':
          newPair.awaitingTest = payload.value
          break;
        case 'error':

          break;
        case 'fullWidth':
          newPair.fullWidth = payload.value
          break;
        case 'multiLine':
          newPair.multiLine = payload.value
          break;
      }
      break;
    case 'object':
      if (payload.field === 'error' && isRegexError(payload.value)) {
          newPair.error = payload.value
        }
  }

  return newPair
}

export const regexPairs : Reducer = (state : UiRegex[] = [defaultRegex] , action) : UiRegex[] => {
  switch(action.type) {
    case 'REGEX_INSERT_BEFORE':
      return insertNow(state, action.payload, true);

    case 'REGEX_INSERT_AFTER':
      return insertNow(state, action.payload, false);

    case 'REGEX_DELETE':
      return state.filter(pair => pair.id !== action.payload.id)

    case 'REGEX_UPDATE':
      return state.map((pair : UiRegex) : UiRegex => {
        if (pair.id === action.payload.id) {
          return updatePair(pair, action.payload)
        } else {
          return pair
        }
      })

    default:
      return state
  }
}
