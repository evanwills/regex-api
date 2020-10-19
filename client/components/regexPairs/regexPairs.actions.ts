import { PairAction, PairActionType, PairUpdateAction, pairFields } from './regexPairs'

export const regexPairsActionCreator = (actionType: string, id: string) : PairAction | null => {
  let _type : PairActionType

  switch (actionType) {
    case 'before':
      _type = PairActionType.INSERT_BEFORE
      break;
    case 'after':
      _type = PairActionType.INSERT_AFTER
      break;
    case 'up':
      _type = PairActionType.MOVE_UP
      break;
    case 'down':
      _type = PairActionType.MOVE_DOWN
      break;
    case 'delete':
      _type = PairActionType.DELETE
      break;
    default:
      return null
  }

  return {
    type: _type,
    payload: {
      id: id
    }
  }
}


export const regexPairsUpdateActionCreator = (id: string, fieldName: pairFields) => {
  return (value: string|boolean) : PairUpdateAction => {
    return {
      type: PairActionType.UPDATE,
      payload: {
        id: id,
        field: fieldName,
        value: value,
        error: ''
      }
    }
  }
}
