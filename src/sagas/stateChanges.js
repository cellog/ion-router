import { call, put } from 'redux-saga/effects'

import * as actions from '../actions'
import * as selectors from '../selectors'

export function changed(oldItems, newItems) {
  return Object.keys({ ...newItems, ...oldItems })
    .filter(key => !Object.prototype.hasOwnProperty.call(oldItems, key) ||
    oldItems[key] !== newItems[key])
}

export function getUrlUpdate(state, s) {
  const oldParams = selectors.oldParams(state, s.name)
  const newParams = s.paramsFromState(state)
  const changes = changed(oldParams, newParams)
  if (!changes.length) return false
  return s['@parser'].reverse(newParams)
}

export function *handleStateChange(state, enhancedRoutes) {
  for (let i = 0; i < state.routing.routes.ids.length; i++) {
    const s = enhancedRoutes[state.routing.routes.ids[i]]
    if (yield call(selectors.matchedRoute, state, s.name)) {
      const url = yield call(getUrlUpdate, state, s)
      if (url) {
        const params = yield call([s['@parser'], s['@parser'].match], url)
        const newState = yield call([s, s.stateFromParams], params, state)
        yield put(actions.setParamsAndState(s.name, params, newState))
        yield put(actions.push(url))
      }
    }
  }
}
