import { createPath } from 'history'

import routerReducer from './reducer'
import * as actions from './actions'
import * as enhancers from './enhancers'
import { connectLink } from './Link'
import { connectRoutes } from './Routes'
import { connectToggle } from './Toggle'
import middleware from './middleware'

export { middleware as makeRouterMiddleware }

export const options = {
  server: false,
  enhancedRoutes: {},
  pending: false,
  resolve: false,
}


export { actionHandlers } from './middleware'
export reducer from './reducer'

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

export default function makeRouter(connect, store, routeDefinitions,
  isServer = false, opts = options) {
  connectLink(connect)
  connectRoutes(connect)
  connectToggle(connect)
  opts.isServer = isServer // eslint-disable-line
  if (routeDefinitions) {
    store.dispatch(synchronousMakeRoutes(routeDefinitions, opts))
  }
}
