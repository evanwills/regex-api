import { PairAction, PairInsertAction, PairActionType } from './regexPairs'
import { timeAsID, getID } from '../../utils/generic-utils'
import { ClientUiState } from '../../state/regex-api--ui'
import { Store, Middleware, AnyAction } from 'redux'

/**
 * newPairIdMW appends a unique (newID) ID to the action payload
 */
export const newPairIdMW = store => next => (action : PairAction) : PairAction | PairInsertAction => {
  switch(action.type) {
    case PairActionType.INSERT_BEFORE:
    case PairActionType.INSERT_AFTER:
      const state : ClientUiState = store.getState()
      const newId : string = timeAsID()
      const IdCount = state.regex.regexes.reduce(
        (i, pair) => (getID(pair.id) === newId) ? i + 1 : i,
        0
      )

      return next({
        type: action.type,
        payload: {
          id: action.payload.id,
          newID: (IdCount === 0) ? newId : newId + '-' + (IdCount + 1)
        }
      })
    default:
      return next(action)
  }
}


export const pairRelPosMW = store : Store => next : MiddleWare => (action : PairAction| AnyAction) : PairAction | PairInsertAction => {
  switch (action.type) {
    case PairActionType.INSERT_BEFORE:
    case PairActionType.INSERT_AFTER:
    case PairActionType.DELETE:
    case PairActionType.MOVE_UP:
    case PairActionType.MOVE_DOWN:
      const state : ClientUiState = store.getState()
      const pairIndex = state.regex.regexes.reduce(
        (i, pair, index) => (pair.id === action.payload.id) ? index : i,
        -1
      )

      if (pairIndex === -1) {
        throw Error('Could not find Regex Pair matching ID "' + action.payload.id + '"')
      } else {
        return next({
          ...action,
          payload: {
            ...action.payload,
            isFirst: (pairIndex === 0),
            isLast: (pairIndex === (state.regex.regexes.length - 1))
          }
        })
      }

    default:
      return next(action)
      break;
  }
}
