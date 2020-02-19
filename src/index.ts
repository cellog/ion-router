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

export { reducer, IonRouterOptions }

export {
  IonRouterRoute,
  ActionVerbs,
  ActionHistoryKeys,
  isCallableVerb,
  RouteParams,
  RouteState,
  AllUrlActions,
  IonRouterActions,
  UrlAction,
  stateRouteShape,
  push,
  replace,
  go,
  goBack,
  goForward,
  MatchRoutesAction,
  matchRoutes,
  StateNotRequiredLocation,
  RouteAction,
  route,
  EditRouteAction,
  addRoute,
  BatchAddRoutesAction,
  BatchRemoveRoutesAction,
  batchRoutes,
  RemoveRouteAction,
  removeRoute,
  batchRemoveRoutes,
  SetParamsAndStateAction,
  setParamsAndState,
  ExitRoutesAction,
  exitRoutes,
  EnterRoutesAction,
  enterRoutes,
  PendingUpdatesAction,
  pending,
  CommittedUpdatesAction,
  commit,
} from './actions'
export { RouterContext, Context } from './Context'
export { DisplaysChildren } from './DisplaysChildren'
export {
  DeclareRoute,
  MapInBetweenActions,
  EnhancedRoute,
  GetUpdateStateReturn,
  enhanceRoute,
  EnhancedRoutes,
  save,
} from './enhancers'
export {
  filter,
  diff,
  changed,
  urlFromState,
  getStateUpdates,
  updateState,
  template,
  exitRoute,
  stateFromLocation,
  matchRoutesHelper,
  makeRoute,
  batchRoutesHelper,
  removeRouteHelper,
  batchRemoveRoutesHelper,
} from './helpers'
export { Link } from './Link'
export {
  MiddlewareListener,
  HandlerResult,
  ActionHandler,
  processHandler,
  createMiddleware,
} from './middleware'
export { IonRouterState } from './reducer'
export { Route } from './Route'
export { Routes } from './Routes'
export { RouteToggle } from './RouteToggle'
export {
  matchedRoute,
  noMatches,
  oldParams,
  oldState,
  matchedRoutes,
  location,
  stateExists,
  FullStateWithRouter,
} from './selectors'
import Toggle from './Toggle'
export { Toggle }

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
