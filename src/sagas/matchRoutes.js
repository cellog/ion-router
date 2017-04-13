import { call, put, select } from 'redux-saga/effects'

import * as selectors from '../selectors'
import * as actions from '../actions'
import * as urlChanges from './urlChanges'

export function template(s, params) {
  return s.exitParams instanceof Function ?
    { ...s.exitParams(params) } : { ...s.exitParams }
}

export const exitRoute = (state, enhanced) => function *(s) {
  const params = s.params
  let parentParams = params
  let a = s
  while (a.parent) {
    const parent = enhanced[a.parent]
    if (!selectors.matchedRoute(state, parent.name)) {
      // we have left a child route and its parent
      parentParams = { ...parentParams, ...(yield call(template, parent, parentParams)) }
    }
    a = parent
  }
  parentParams = { ...parentParams, ...template(s, parentParams) }
  yield call(urlChanges.updateState, s, parentParams, state)
}

export const diff = (main, second) => main.filter(name => second.indexOf(name) === -1)
export const exitRoutes = exit => location => name => call(exit, name, location)
export const filter = (enhancedRoutes, path) => name => enhancedRoutes[name]['@parser'].match(path)
export const mapRoute = (er, enhancedRoutes) => route => exitRoutes(er)(enhancedRoutes[route])

export function *matchRoutes(state, path, enhancedRoutes) {
  const lastMatches = state.routing.matchedRoutes
  const matchedRoutes = state.routing.routes.ids
    .filter(filter(enhancedRoutes, path))
  const exiting = diff(lastMatches, matchedRoutes)
  const entering = diff(matchedRoutes, lastMatches)

  yield put(actions.matchRoutes(matchedRoutes))
  if (exiting.length) {
    yield put(actions.exitRoutes(exiting))
  }
  if (entering.length) {
    yield put(actions.enterRoutes(entering))
  }
  if (exiting.length) {
    const er = yield call(exitRoute, state, enhancedRoutes)
    const r = yield call(mapRoute, er, enhancedRoutes)
    yield exiting.map(route => call(r, route))
  }
  yield call(urlChanges.stateFromLocation, enhancedRoutes, yield select(), path)
}
