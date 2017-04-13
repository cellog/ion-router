import { takeEvery, take, fork, call, put, select } from 'redux-saga/effects'
import { createPath } from 'history'

import * as types from '../types'
import * as actions from '../actions'
import * as routes from './matchRoutes'
import * as create from './createRoutes'
import * as stateChanges from './stateChanges'
import { begin, commit, nonBlockingPending } from '..'

export function *browserListener(history) {
  while (true) { // eslint-disable-line
    const action = yield take(types.ACTION)
    yield fork([history, history[action.payload.verb]], action.payload.route, action.payload.state)
  }
}

export function *locationListener(channel, options) {
  let location = false
  while (true) { // eslint-disable-line
    const locationChange = yield take(channel)
    const path = createPath(locationChange.location)
    if (location !== path) {
      location = path
      if (yield call(nonBlockingPending, options)) {
        continue // eslint-disable-line
      }
      yield call(begin, options)
      yield call(routes.matchRoutes, yield select(), path, options.enhancedRoutes)
      yield put(actions.route(locationChange.location))
      yield call(commit, options)
    }
  }
}

export function *stateMonitor(options) {
  let state = yield select()
  while (true) { // eslint-disable-line
    yield take('*')
    const newState = yield select()
    if (yield call(nonBlockingPending, options)) {
      state = newState
      continue // eslint-disable-line
    }
    if (state !== newState) {
      state = newState
      yield call(begin, options)
      yield call(stateChanges.handleStateChange, state, options.enhancedRoutes)
      yield call(commit, options)
    }
  }
}

export function *routeMonitor(options, history) {
  yield takeEvery([types.EDIT_ROUTE, types.BATCH_ROUTES], create.enhanceSaga, options, history)
  yield takeEvery(types.SET_PARAMS, create.saveParams, options)
}
