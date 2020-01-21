import * as actions from './actions'
import * as enhancers from './enhancers'
import middleware from './middleware'

import makeRouterStoreEnhancer, { IonRouterOptions } from './storeEnhancer'

export { makeRouterStoreEnhancer }
export { middleware as makeRouterMiddleware }

export { actionHandlers } from './middleware'
import reducer from './reducer'
import { FullStateWithRouter } from './selectors'
import { Store, AnyAction } from 'redux'

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
export function synchronousMakeRoutes<
  StoreState extends FullStateWithRouter,
  Actions extends AnyAction | actions.IonRouterActions,
  E extends enhancers.DeclareRoute<StoreState, any, any, Actions>[]
>(routes: E, opts: IonRouterOptions['routerOptions']) {
  const action = actions.batchRoutes<StoreState, '@@ion-router/BATCH_ROUTES'>(
    routes
  )
  opts.enhancedRoutes = Object.keys(action.payload.routes).reduce(
    (en, route) => enhancers.save(action.payload.routes[route], en),
    opts.enhancedRoutes
  )
  return action
}

export default function makeRouter<
  StoreState extends FullStateWithRouter,
  A extends AnyAction | actions.IonRouterActions,
  E extends enhancers.DeclareRoute<StoreState, any, any, A>[]
>(
  connect: any,
  store: Store<StoreState & IonRouterOptions, A> & IonRouterOptions,
  routeDefinitions: E,
  isServer = false
) {
  store.routerOptions.isServer = isServer
  if (routeDefinitions) {
    store.dispatch(
      synchronousMakeRoutes<StoreState, A, E>(
        routeDefinitions,
        store.routerOptions
      ) as A
    )
    // re-send now that routes exist
    store.dispatch(actions.route(store.getState().routing.location) as A)
  }
}
