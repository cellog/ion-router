import { call, select } from 'redux-saga/effects'
import { createPath } from 'history'

import * as enhancers from '../enhancers'
import * as types from '../types'
import { setEnhancedRoutes, begin, commit, pending } from '..'

import * as routing from './matchRoutes'

export function *enhanceSaga(options, history, action) {
  const routes = action.type === types.EDIT_ROUTE ? {
    [action.payload.name]: action.payload
  } : action.payload.routes
  yield call(setEnhancedRoutes, Object.keys(routes).reduce((en, route) =>
    enhancers.save(routes[route], en), options.enhancedRoutes))

  yield call(pending, options)
  yield call(begin, options)
  yield call(routing.matchRoutes, yield select(),
    createPath(history.location), options.enhancedRoutes)
  yield call(commit, options)
}

export function *saveParams(options, action) {
  yield call(setEnhancedRoutes, {
    ...options.enhancedRoutes,
    [action.payload.route]: {
      ...options.enhancedRoutes[action.payload.route],
      params: action.payload.params,
      state: action.payload.state
    }
  })
}
