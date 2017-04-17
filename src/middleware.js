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

// every action handler accepts enhanced routes, state, and action
// and returns enhanced routes and a list of actions to send
// so all of them are pure
export const actionHandlers = {
  [ignoreKey]: ignore,

  [types.EDIT_ROUTE]: (enhancedRoutes, state, action) => {
    const route = action.payload
    return {
      newEnhancedRoutes: enhancers.save(route, enhancedRoutes),
      toDispatch: []
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
