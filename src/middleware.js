import createBrowserHistory from 'history/createBrowserHistory'
import { createPath } from 'history'
import invariant from 'invariant'

import * as types from './types'
import * as actions from './actions'
import * as enhancers from './enhancers'
// import * as selectors from './selectors'
import { options, setEnhancedRoutes } from '.'

function ignore(store, next, action) {
  return next(action)
}

export const ignoreKey = '#@#$@$#@$@#$@#$@#$@#$@#$@#$@#$@#$@#$@#$ignore'
export const filter = (enhancedRoutes, path) => name => enhancedRoutes[name]['@parser'].match(path)
export const diff = (main, second) => main.filter(name => second.indexOf(name) === -1)

// every action handler accepts enhanced routes, state, and action
// and returns enhanced routes and a list of actions to send
// so all of them are pure
export const actionHandlers = {
  [ignoreKey]: ignore,

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

  [types.ROUTE]: (newEnhancedRoutes, state, action) => {
    const toDispatch = []
    const lastMatches = state.routing.matchedRoutes
    const path = createPath(state.routing.location)
    const matchedRoutes = state.routing.routes.ids
      .filter(filter(newEnhancedRoutes, path))
    const exiting = diff(lastMatches, matchedRoutes)
    const entering = diff(matchedRoutes, lastMatches)
    return {
      newEnhancedRoutes,
      toDispatch
    }
  },
  '*': (enhancedRoutes, state, action) => { // eslint-disable-line
    // process state changes and how they affect URL here
    return {
      newEnhancedRoutes: enhancedRoutes,
      toDispatch: []
    }
  }
}

function invariantHelper(type, condition, message) {
  invariant(condition, `router middleware action handler for action type "${type}" does not ${message}`)
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
    const info = handler(opts.enhancedRoutes, state, action)
    invariantHelper(action.type, info !== undefined, `return a map { newEnhancedRoutes, toDispatch }`)
    invariantHelper(action.type, info.newEnhancedRoutes !== undefined &&
      info.newEnhancedRoutes !== null &&
      typeof info.newEnhancedRoutes === 'object' &&
      !Array.isArray(info.newEnhancedRoutes),
      'return a map for newEnhancedRoutes'
    )
    const newEnhancedRoutes = info.newEnhancedRoutes
    setEnhancedRoutes(newEnhancedRoutes, opts)
    invariantHelper(action.type, Array.isArray(info.toDispatch), 'return an array for toDispatch')
    invariantHelper(action.type, info.toDispatch.every(act => act.type),
      'return a toDispatch array with all actions containing a "type" key')
    const toDispatch = info.toDispatch
    activeListener = myHandlers[ignoreKey]
    try {
      const ret = next(action)
      toDispatch.forEach(act => store.dispatch(act))
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
    return next => action => activeListener(store, next, action)
  }
}
