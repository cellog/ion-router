import { fork, call, put } from 'redux-saga/effects'

import * as actions from '../actions'
import * as stateChanges from './stateChanges'

export function getStateUpdates(s, newState) {
  const oldState = s.state
  const changes = stateChanges.changed(oldState, newState)
  const update = s.updateState
  return changes.map(key => (update[key] ? update[key](newState[key]) : false)).filter(t => t)
}

export function *updateState(s, params, state) {
  const newState = s.stateFromParams(params, state)
  const changes = yield call(getStateUpdates, s, newState)
  if (changes.length) {
    yield put(actions.setParamsAndState(s.name, params, newState))
    for (let i = 0; i < changes.length; i++) {
      if (changes[i].type) changes[i] = [changes[i]]
      yield changes[i].map(event => put(event))
    }
  }
}

export function *stateFromLocation(enhancedRoutes, state, location) {
  const names = Object.keys(enhancedRoutes)
  for (let i = 0; i < names.length; i++) {
    const s = enhancedRoutes[names[i]]
    const params = s['@parser'].match(location)
    if (params) yield fork(updateState, s, params, state)
  }
}
