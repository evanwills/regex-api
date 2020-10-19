import { applyMiddleware, createStore, Store } from 'redux'
import { regexPairsReducer } from './components/regexPairs/regexPairs.reducers'
import { newPairIdMW, pairRelPosMW } from './components/regexPairs/regexPairs.middleware'

const store : Store = createStore(
  regexPairsReducer,
  applyMiddleware(newPairIdMW, pairRelPosMW)
)
