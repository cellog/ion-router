import RouteParser from 'route-parser'
import { createPath } from 'history'
import { put, take, select, call } from 'redux-saga/effects'

import * as actions from './actions'
import * as selectors from './selectors'

export function fake() {
  return {}
}

export function enterPlaceholder() {
  return true
}

export function exitPlaceholder() {
  return true
}

export default class RouteManager {
  constructor(history, {
    name, path, paramsFromState = fake, stateFromParams = fake, updateState = {},
    enter = enterPlaceholder, exit = exitPlaceholder
  }) {
    this.name = name
    this.path = path
    this.route = new RouteParser(path)
    this.paramsFromState = paramsFromState
    this.stateFromParams = stateFromParams
    this.enter = enter
    this.exit = exit
    this.update = updateState
    this.history = history
  }

  url(params) {
    return this.route.reverse(params)
  }

  match(url) {
    return this.route.match(url)
  }

  getState(params) {
    return this.stateFromParams(params)
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
    const newState = this.getState(params)
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
      yield take('*')
      yield call([this, this.locationFromState])
    }
  }

  *monitorUrl(location) {
    yield call([this, this.stateFromLocation], location)
  }
}
