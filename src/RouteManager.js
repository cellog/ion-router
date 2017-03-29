import RouteParser from 'route-parser'
import { createPath } from 'history'
import { put, take, select, call } from 'redux-saga/effects'

import * as types from './types'
import * as actions from './actions'
import * as selectors from './selectors'

export function fake() {
  return {}
}

export default class RouteManager {
  constructor(history, {
    name, path, exitParams, paramsFromState = fake, stateFromParams = fake, updateState = {},
  }) {
    this.name = name
    this.path = path
    this.route = new RouteParser(path)
    if (exitParams) {
      this.exitParams = exitParams
    } else {
      const reversed = this.route.reverse()
      if (reversed) {
        this.exitParams = this.route.match(reversed)
      }
    }
    this.paramsFromState = paramsFromState
    this.stateFromParams = stateFromParams
    this.update = updateState
    this.history = history
  }

  url(params) {
    return this.route.reverse(params)
  }

  match(url) {
    return this.route.match(url)
  }

  getState(params, state) {
    return this.stateFromParams(params, state)
  }

  getParams(state) {
    return this.paramsFromState(state)
  }

  static changed(oldItems, newItems) {
    return Object.keys(newItems)
      .filter(key => !Object.prototype.hasOwnProperty.call(oldItems, key) ||
        oldItems[key] !== newItems[key])
  }

  getStateUpdates(state, params, route) {
    const oldState = selectors.oldState(state, route)
    const newState = this.getState(params, state)
    const changes = RouteManager.changed(oldState, newState)
    return changes.map(key => this.update[key](newState[key]))
  }

  getUrlUpdate(state, route) {
    const oldParams = selectors.oldParams(state, route)
    const newParams = this.getParams(state)
    const changes = RouteManager.changed(oldParams, newParams)
    if (!changes.length) return false
    return this.url(newParams)
  }

  *stateFromLocation(location) {
    const state = yield select()
    const params = this.match(location.pathname ? createPath(location) : location)
    if (!params) return // this url does not match this route
    yield* this.updateState(params, state)
  }

  *updateState(params, state) {
    const newState = this.getState(params)
    const changes = this.getStateUpdates(state, params, this.name)
    if (changes.length) {
      yield put(actions.setParamsAndState(this.name, params, newState))
      for (let i = 0; i < changes.length; i++) {
        if (changes[i].type) changes[i] = [changes[i]]
        yield changes[i].map(event => put(event))
      }
    }
  }

  *exitRoute() {
    const state = yield select()
    const params = selectors.oldParams(state, this.name)
    const template = this.exitParams instanceof Function ?
      yield call(this.exitParams, params) : this.exitParams
    yield* this.updateState(template, state)
  }

  *locationFromState() {
    const state = yield select()
    if (!selectors.matchedRoute(state, this.name)) return
    const url = this.getUrlUpdate(state, this.name)
    if (url) {
      const params = this.match(url)
      const newState = this.getState(params)
      yield put(actions.setParamsAndState(this.name, params, newState))
      yield put(actions.push(url))
    }
  }

  *initState() {
    yield call([this, this.stateFromLocation], this.history.location)
  }

  *monitorState() {
    while (true) { // eslint-disable-line
      const action = yield take('*')
      if (action.type === types.PENDING_UPDATES) {
        yield take(types.COMMITTED_UPDATES)
      }
      yield call([this, this.locationFromState])
    }
  }

  *monitorUrl(location) {
    yield call([this, this.stateFromLocation], location)
  }
}
