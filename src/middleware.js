import createBrowserHistory from 'history/createBrowserHistory'
import { createPath } from 'history'

import * as types from './types'
import * as actions from './actions'

export default function createMiddleware(history = createBrowserHistory()) {
  let lastLocation = createPath(history.location)
  const stateListeners = {
    active: 'listen',
    listen: (store, next, action) => {
      if (!action || !action.type) return next(action)
      switch (action.type) {
        case types.ROUTE:
        default:
          return next(action)
      }
    },
    ignore: (store, next, action) => next(action)
  }
  return (store) => {
    history.listen((location) => {
      const a = createPath(location)
      if (a === lastLocation) return
      lastLocation = a
      store.dispatch(actions.route(location))
    })
    return next => action => stateListeners[stateListeners.active](store, next, action)
  }
}
