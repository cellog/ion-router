import * as actions from './actions'
import * as enhancers from './enhancers'
import { connectLink } from './Link'
import { connectRoutes } from './Routes'
import { connectToggle } from './Toggle'
import middleware from './middleware'

import makeRouterStoreEnhancer from './storeEnhancer'

export { makeRouterStoreEnhancer }
export { middleware as makeRouterMiddleware }

export { actionHandlers } from './middleware'
export reducer from './reducer'

// for unit-testing purposes
export function synchronousMakeRoutes(routes, opts) {
  const action = actions.batchRoutes(routes)
  opts.enhancedRoutes = Object.keys(action.payload.routes).reduce((en, route) => // eslint-disable-line
    enhancers.save(action.payload.routes[route], en), opts.enhancedRoutes)
  return action
}

export default function makeRouter(connect, store, routeDefinitions,
  isServer = false, storeKey = 'store') {
  connectLink(connect, storeKey)
  connectRoutes(connect, storeKey)
  connectToggle(connect, storeKey)
  store.routerOptions.isServer = isServer // eslint-disable-line
  if (routeDefinitions) {
    store.dispatch(synchronousMakeRoutes(routeDefinitions, store.routerOptions))
  }
}
