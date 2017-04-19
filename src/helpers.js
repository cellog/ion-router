import { createPath } from 'history'

import * as actions from './actions'
import * as selectors from './selectors'
import * as enhancers from './enhancers'

export const filter = (enhancedRoutes, path) => name => enhancedRoutes[name]['@parser'].match(path)
export const diff = (main, second) => main.filter(name => second.indexOf(name) === -1)

export function changed(oldItems, newItems) {
  return Object.keys({ ...newItems, ...oldItems })
    .filter(key => !Object.prototype.hasOwnProperty.call(oldItems, key) ||
    oldItems[key] !== newItems[key])
}

export function urlFromState(enhancedRoutes, state) {
  const toDispatch = []
  const updatedRoutes = {}
  let url = false
  state.routing.matchedRoutes.forEach((route) => {
    const s = enhancedRoutes[route]
    const newParams = s.paramsFromState(state)
    const newState = s.stateFromParams(newParams)
    if (changed(s.params, newParams)) {
      updatedRoutes[route] = {
        ...enhancedRoutes[route],
        params: newParams,
        state: newState,
      }
      toDispatch.push(actions.setParamsAndState(route, newParams, newState))
      if (!url) url = s['@parser'].reverse(newParams)
    }
  })
  const tempState = {
    ...state,
    routing: {
      ...state.routing,
      routes: {
        ...state.routing.routes,
        routes: {
          ...state.routing.routes.routes,
          ...Object.keys(updatedRoutes).reduce((routes, key) => ({
            ...routes,
            [key]: {
              ...state.routing.routes.routes[key],
              params: updatedRoutes[key].params,
              state: updatedRoutes[key].state
            }
          }), {})
        }
      }
    }
  }
  const {
    toDispatch: t
  } = matchRoutes(enhancedRoutes, tempState, actions.route({ // eslint-disable-line
    pathname: url
  }), false)
  toDispatch.push(actions.push(url))
  return {
    newEnhancedRoutes: { ...enhancedRoutes, ...updatedRoutes },
    toDispatch: [...toDispatch, ...t],
  }
}

export function getStateUpdates(s, newState) {
  const oldState = s.state
  const changes = changed(oldState, newState)
  const update = s.updateState
  return changes.map(key => (update[key] ? update[key](newState[key]) : false)).filter(t => t)
}

export function updateState(s, params, state) {
  const newState = s.stateFromParams(params, state)
  const changes = getStateUpdates(s, newState)
  const acts = []
  const updatedRoutes = {}
  if (changes.length) {
    acts.push(actions.setParamsAndState(s.name, params, newState))
    updatedRoutes[s.name] = {
      ...s,
      params,
      state: newState
    }
    for (let i = 0; i < changes.length; i++) {
      if (changes[i].type) changes[i] = [changes[i]]
      changes[i].forEach(event => acts.push(event))
    }
  }
  return {
    acts,
    updatedRoutes
  }
}

export function template(s, params) {
  return s.exitParams instanceof Function ?
    { ...s.exitParams(params) } : { ...s.exitParams }
}

export const exitRoute = (state, enhanced, name) => {
  const s = enhanced[name]
  const params = s.params
  let parentParams = params
  let a = s
  while (a.parent) {
    const parent = enhanced[a.parent]
    if (!selectors.matchedRoute(state, parent.name)) {
      // we have left a child route and its parent
      parentParams = { ...parentParams, ...(template(parent, parentParams)) }
    }
    a = parent
  }
  parentParams = { ...parentParams, ...template(s, parentParams) }
  return updateState(s, parentParams, state)
}

export function stateFromLocation(enhancedRoutes, state, location) {
  const names = Object.keys(enhancedRoutes)
  let ret = []
  let n = enhancedRoutes
  for (let i = 0; i < names.length; i++) {
    const s = enhancedRoutes[names[i]]
    const params = s['@parser'].match(location)
    if (params) {
      const { updatedRoutes, acts } = updateState(s, params, state, n)
      n = { ...n, ...updatedRoutes }
      ret = [...ret, ...acts]
    } else if (state.routing.matchedRoutes.includes(names[i])) {
      const { updatedRoutes, acts } = exitRoute(state, n, names[i])
      ret = [...ret, ...acts]
      n = { ...n, ...updatedRoutes }
    }
  }
  return {
    updatedRoutes: n,
    acts: ret
  }
}

export function matchRoutes(enhancedRoutes, state, action, updateParams = true) {
  const toDispatch = []
  const lastMatches = state.routing.matchedRoutes
  const path = createPath(action.payload)
  const matchedRoutes = state.routing.routes.ids
    .filter(filter(enhancedRoutes, path))
  const exiting = diff(lastMatches, matchedRoutes)
  const entering = diff(matchedRoutes, lastMatches)
  if (exiting.length || entering.length) {
    toDispatch.push(actions.matchRoutes(matchedRoutes))
    if (exiting.length) toDispatch.push(actions.exitRoutes(exiting))
    if (entering.length) toDispatch.push(actions.enterRoutes(entering))
  }
  if (updateParams) {
    const { updatedRoutes: newEnhancedRoutes, acts } =
      stateFromLocation(enhancedRoutes, state, path)
    acts.forEach(act => toDispatch.push(act))
    return {
      newEnhancedRoutes,
      toDispatch
    }
  }
  return {
    newEnhancedRoutes: enhancedRoutes,
    toDispatch
  }
}

export function makeRoute(enhancedRoutes, state, action) {
  return {
    newEnhancedRoutes: enhancers.save(action.payload, enhancedRoutes),
    toDispatch: []
  }
}

export function batchRoutes(enhancedRoutes, state, action) {
  return {
    newEnhancedRoutes: {
      ...enhancedRoutes,
      ...action.payload.ids.reduce((routes, name) => ({
        ...routes,
        [name]: enhancers.enhanceRoute(action.payload.routes[name])
      }), {})
    },
    toDispatch: []
  }
}

export function removeRoute(enhancedRoutes, state, action) {
  const newRoutes = { ...enhancedRoutes }
  delete newRoutes[action.payload]
  return {
    newEnhancedRoutes: newRoutes,
    toDispatch: []
  }
}

export function batchRemoveRoutes(enhancedRoutes, state, action) {
  const newRoutes = { ...enhancedRoutes }
  action.payload.ids.forEach(name => delete newRoutes[name])
  return {
    newEnhancedRoutes: newRoutes,
    toDispatch: []
  }
}
