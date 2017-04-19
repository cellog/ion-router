import createBrowserHistory from 'history/createBrowserHistory'
import { createPath } from 'history'
import { createStore, applyMiddleware } from 'redux'

import routerReducer from './reducer'
import middleware, { actionHandlers } from './middleware'
import * as actions from './actions'
import * as enhancers from './enhancers'
import { connectLink } from './Link'
import { connectRoutes } from './Routes'
import { connectToggle } from './Toggle'

export const options = {
  server: false,
  enhancedRoutes: {},
  pending: false,
  resolve: false,
}

export const setServer = (val = true) => {
  options.server = val
}

export function makePath(name, params) {
  if (!options.enhancedRoutes[name]) return false
  return options.enhancedRoutes[name]['@parser'].reverse(params)
}

export function matchesPath(route, locationOrPath) {
  if (!options.enhancedRoutes[route]) return false
  return options.enhancedRoutes[route]['@parser'].match(locationOrPath.pathname ? createPath(locationOrPath) : locationOrPath)
}

export const onServer = () => options.server
export const setEnhancedRoutes = (r, opts = options) => {
  opts.enhancedRoutes = r // eslint-disable-line
}

// for unit-testing purposes
export function synchronousMakeRoutes(routes, opts = options) {
  const action = actions.batchRoutes(routes)
  setEnhancedRoutes(Object.keys(action.payload.routes).reduce((en, route) =>
    enhancers.save(action.payload.routes[route], en), opts.enhancedRoutes), opts)
  return action
}

export function routingReducer(reducers = state => ({ ...(state || {}) })) {
  return (state, action) => {
    if (!state) {
      return {
        routing: routerReducer(),
        ...(reducers() || {})
      }
    }
    let newState = state
    if (!newState.routing) {
      newState = {
        ...state,
        routing: routerReducer()
      }
    } else {
      const routing = routerReducer(newState.routing, action)
      if (routing !== newState.routing) {
        newState = {
          ...newState,
          routing
        }
      }
    }
    return reducers(newState, action)
  }
}

export default (
  connect, routeDefinitions, history = createBrowserHistory(),
  isServer = false, opts = options, handlers = actionHandlers) => (reducer, state, enhancer) => {
    connectLink(connect)
    connectRoutes(connect)
    connectToggle(connect)
    options.isServer = isServer
    const routerMiddleware = applyMiddleware(middleware(history, opts, handlers))(createStore)
    const store = routerMiddleware(routingReducer(reducer), state, enhancer)
    if (routeDefinitions) {
      store.dispatch(synchronousMakeRoutes(routeDefinitions, opts))
    }
    return {
      ...store,
      dispatch: store.dispatch
    }
  }
