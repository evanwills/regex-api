import { PairAction, PairInsertAction, PairActionType } from './regexPairs'
import { timeAsID } from '../../utils/generic-utils'


export const newPairMiddleware = (action : PairAction) : PairAction | PairInsertAction => {
  switch(action.type) {
    case PairActionType.INSERT_BEFORE:
    case PairActionType.INSERT_AFTER:
      return {
        type: action.type,
        payload: {
          id: action.payload.id,
          newID: timeAsID()
        }
      }
    default:
      return action
  }
}
