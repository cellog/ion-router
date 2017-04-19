import createBrowserHistory from 'history/createBrowserHistory'
import { createPath } from 'history'
import invariant from 'invariant'

import * as types from './types'
import * as actions from './actions'
import * as helpers from './helpers'
import { options, setEnhancedRoutes } from '.'

function ignore(store, next, action) {
  return next(action)
}

export const ignoreKey = '#@#$@$#@$@#$@#$@#$@#$@#$@#$@#$@#$@#$@#$ignore'

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
  [types.EDIT_ROUTE]: helpers.makeRoute,
  [types.BATCH_ROUTES]: helpers.batchRoutes,
  [types.REMOVE_ROUTE]: helpers.removeRoute,
  [types.BATCH_REMOVE_ROUTES]: helpers.batchRemoveRoutes,

  [types.ROUTE]: helpers.matchRoutes,
  '*': helpers.urlFromState
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
  handlers = actionHandlers, debug = false) {
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
      if (debug && info.toDispatch.length) {
        console.info(`ion-router PROCESSING: ${action.type}`) // eslint-disable-line
        console.info(`dispatching: `, info.toDispatch) // eslint-disable-line
      }
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
    store.dispatch(actions.route(history.location))
    return next => (action) => {
      const ret = activeListener(store, next, action)
      if (action.type === types.ACTION) {
        if (!action.payload.route) {
          throw new Error(`ion-router action ${action.payload.verb} must be a string or a location object`)
        }
        history[action.payload.verb](action.payload.route, action.payload.state)
      }
      return ret
    }
  }
}
