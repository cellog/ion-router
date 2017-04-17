import createBrowserHistory from 'history/createBrowserHistory'
import { createPath } from 'history'
import invariant from 'invariant'

import * as types from './types'
import * as actions from './actions'
import * as enhancers from './enhancers'
import * as selectors from './selectors'
import { options, setEnhancedRoutes } from '.'

function ignore(store, next, action) {
  return next(action)
}

export const ignoreKey = '#@#$@$#@$@#$@#$@#$@#$@#$@#$@#$@#$@#$@#$ignore'
export const filter = (enhancedRoutes, path) => name => enhancedRoutes[name]['@parser'].match(path)
export const diff = (main, second) => main.filter(name => second.indexOf(name) === -1)

export function template(s, params) {
  return s.exitParams instanceof Function ?
    { ...s.exitParams(params) } : { ...s.exitParams }
}

export function changed(oldItems, newItems) {
  return Object.keys({ ...newItems, ...oldItems })
    .filter(key => !Object.prototype.hasOwnProperty.call(oldItems, key) ||
    oldItems[key] !== newItems[key])
}

export function urlFromState(enhancedRoutes, state) {
  const toDispatch = []
  const updatedRoutes = {}
  const urls = []
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
      urls.push(s['@parser'].reverse(newParams))
    }
  })
  const url = urls.reduce((a, b) => (a.length > b.length ? a : b), '')
  if (!url || url === createPath(state.routing.location)) {
    return {
      newEnhancedRoutes: { ...enhancedRoutes, ...updatedRoutes },
      toDispatch
    }
  }
  toDispatch.push(actions.push(url))
  return {
    newEnhancedRoutes: { ...enhancedRoutes, ...updatedRoutes },
    toDispatch
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

function pass(newEnhancedRoutes) {
  return {
    newEnhancedRoutes,
    toDispatch: []
  }
}
// every action handler accepts enhanced routes, state, and action
// and returns enhanced routes and a list of actions to send
// so all of them are pure
export const actionHandlers = {
  [ignoreKey]: ignore,

  [types.ACTION]: pass,
  [types.EDIT_ROUTE]: (enhancedRoutes, state, action) => ({
    newEnhancedRoutes: enhancers.save(action.payload, enhancedRoutes),
    toDispatch: []
  }),
  [types.BATCH_ROUTES]: (enhancedRoutes, state, action) => ({
    newEnhancedRoutes: {
      ...enhancedRoutes,
      ...action.payload.ids.reduce((routes, name) => ({
        ...routes,
        [name]: enhancers.enhanceRoute(action.payload.routes[name])
      }), {})
    },
    toDispatch: []
  }),
  [types.REMOVE_ROUTE]: (enhancedRoutes, state, action) => {
    const newRoutes = { ...enhancedRoutes }
    delete newRoutes[action.payload]
    return {
      newEnhancedRoutes: newRoutes,
      toDispatch: []
    }
  },
  [types.BATCH_REMOVE_ROUTES]: (enhancedRoutes, state, action) => {
    const newRoutes = { ...enhancedRoutes }
    action.payload.ids.forEach(name => delete newRoutes[name])
    return {
      newEnhancedRoutes: newRoutes,
      toDispatch: []
    }
  },

  [types.ROUTE]: (enhancedRoutes, state, action) => {
    const toDispatch = []
    const lastMatches = state.routing.matchedRoutes
    const path = createPath(action.payload)
    const matchedRoutes = state.routing.routes.ids
      .filter(filter(enhancedRoutes, path))
    const exiting = diff(lastMatches, matchedRoutes)
    const entering = diff(matchedRoutes, lastMatches)
    toDispatch.push(actions.matchRoutes(matchedRoutes))
    if (exiting.length) toDispatch.push(actions.exitRoutes(exiting))
    if (entering.length) toDispatch.push(actions.enterRoutes(entering))
    const { updatedRoutes: newEnhancedRoutes, acts } =
      stateFromLocation(enhancedRoutes, state, path)
    acts.forEach(act => toDispatch.push(act))
    return {
      newEnhancedRoutes,
      toDispatch
    }
  },
  '*': urlFromState
}

function invariantHelper(type, condition, message) {
  invariant(condition, `router middleware action handler for action type "${type}" does not ${message}`)
}

export function processHandler(handler, routes, state, action) {
  const info = handler(routes, state, action)
  invariantHelper(action.type, info !== undefined, `return a map { newEnhancedRoutes, toDispatch }`)
  invariantHelper(action.type, info.newEnhancedRoutes !== undefined &&
    info.newEnhancedRoutes !== null &&
    typeof info.newEnhancedRoutes === 'object' &&
    !Array.isArray(info.newEnhancedRoutes),
    'return a map for newEnhancedRoutes'
  )
  invariantHelper(action.type, Array.isArray(info.toDispatch), 'return an array for toDispatch')
  invariantHelper(action.type, info.toDispatch.every(act => act.type),
    'return a toDispatch array with all actions containing a "type" key')
  return info
}

export default function createMiddleware(history = createBrowserHistory(), opts = options,
  handlers = actionHandlers) {
  let lastLocation = createPath(history.location)
  let activeListener = listen // eslint-disable-line
  const myHandlers = {
    ...handlers
  }
  function listen(store, next, action) {
    const handler = myHandlers[action.type] ?
      myHandlers[action.type] :
      myHandlers['*']
    const state = store.getState()
    activeListener = myHandlers[ignoreKey] || ignore
    try {
      if (handler !== myHandlers['*']) {
        const info = processHandler(handler, opts.enhancedRoutes, state, action)
        const ret = next(action)
        info.toDispatch.forEach(act => store.dispatch(act))
        setEnhancedRoutes(info.newEnhancedRoutes, opts)
        return ret
      }
      const ret = next(action)
      const info = processHandler(handler, opts.enhancedRoutes, store.getState(), action)
      setEnhancedRoutes(info.newEnhancedRoutes, opts)
      info.toDispatch.forEach(act => store.dispatch(act))
      return ret
    } finally {
      activeListener = listen
    }
  }
  return (store) => {
    history.listen((location) => {
      const a = createPath(location)
      if (a === lastLocation) return
      lastLocation = a
      store.dispatch(actions.route(location))
    })
    return next => (action) => {
      const ret = activeListener(store, next, action)
      if (action.type === types.ACTION) {
        history[action.payload.verb](action.payload.route, action.payload.state)
      }
      return ret
    }
  }
}
