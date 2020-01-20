import * as actions from './actions'
import * as enhancers from './enhancers'
import middleware from './middleware'

import makeRouterStoreEnhancer, { IonRouterOptions } from './storeEnhancer'

export { makeRouterStoreEnhancer }
export { middleware as makeRouterMiddleware }

export { actionHandlers } from './middleware'
import reducer from './reducer'
import { FullStateWithRouter } from './selectors'
import { Store } from 'redux'

export { reducer }

export * from './actions'
export * from './Context'
export * from './DisplaysChildren'
export * from './enhancers'
export * from './helpers'
export * from './Link'
export * from './middleware'
export * from './reducer'
export * from './Route'
export * from './Routes'
export * from './RouteToggle'
export * from './selectors'
export * from './storeEnhancer'
export * from './Toggle'

// for unit-testing purposes
export function synchronousMakeRoutes(
  routes: enhancers.DeclareRoute<FullStateWithRouter, any, any, any>[],
  opts: IonRouterOptions['routerOptions']
) {
  const action = actions.batchRoutes(routes)
  opts.enhancedRoutes = Object.keys(action.payload.routes).reduce(
    (
      en,
      route // eslint-disable-line
    ) => enhancers.save(action.payload.routes[route], en),
    opts.enhancedRoutes
  )
  return action
}

export default function makeRouter(
  connect: any,
  store: Store & IonRouterOptions,
  routeDefinitions: enhancers.DeclareRoute<
    FullStateWithRouter,
    any,
    any,
    any
  >[],
  isServer = false
) {
  store.routerOptions.isServer = isServer // eslint-disable-line
  if (routeDefinitions) {
    store.dispatch(synchronousMakeRoutes(routeDefinitions, store.routerOptions))
    // re-send now that routes exist
    store.dispatch(actions.route(store.getState().routing.location))
  }
}
