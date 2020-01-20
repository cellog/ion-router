import { createBrowserHistory, History } from 'history'
import invariant from 'invariant'
import {
  compose,
  Store,
  Action,
  AnyAction,
  Reducer,
  StoreEnhancerStoreCreator,
  Dispatch,
} from 'redux'

import middleware, { actionHandlers } from './middleware'
import { EnhancedRoutes } from './enhancers'
import { IonRouterState } from './reducer'
import { IonRouterActions } from './actions'

export interface IonRouterOptions {
  routerOptions: {
    [key: string]: any
    server: boolean
    enhancedRoutes: EnhancedRoutes
  }
}

export function assertEnhancedStore<S, A extends Action<any>>(
  store: any
): asserts store is Store<S, A> & IonRouterOptions {
  invariant(
    store.routerOptions,
    'ion-router error: store has not been initialized.  Did you ' +
      'use the store enhancer?'
  )
}

const enhancer = (
  history: History = createBrowserHistory(),
  handlers = actionHandlers,
  debug = false,
  options = {}
) => (createStore: StoreEnhancerStoreCreator) => <
  S extends { routing: IonRouterState },
  A extends AnyAction = AnyAction | IonRouterActions
>(
  reducer: Reducer<S, A>,
  preloadedState?: any // TODO: when redux exports PreLoadedState use that
): Store<S, A> & IonRouterOptions => {
  const store = {
    ...createStore<S, A>(reducer, preloadedState),
    routerOptions: {
      server: false,
      enhancedRoutes: {},
      ...options,
    },
  }
  const newDispatch = compose(middleware(history, handlers, debug)(store))(
    store.dispatch
  ) as Dispatch<A>
  store.dispatch = newDispatch
  return store
}

export default enhancer
