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
  PreloadedState,
  StoreEnhancer,
} from 'redux'

import middleware, { actionHandlers } from './middleware'
import { EnhancedRoutes } from './enhancers'
import { IonRouterState } from './reducer'
import { IonRouterActions } from './actions'
import { FullStateWithRouter } from './selectors'

export interface IonRouterOptions {
  routerOptions: {
    [key: string]: any
    isServer: boolean
    enhancedRoutes: EnhancedRoutes
  }
}

export function assertEnhancedStore<S, A extends Action<any>>(
  store: any
): asserts store is Store<S, A | IonRouterActions> & IonRouterOptions {
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
) => (createStore: StoreEnhancerStoreCreator) => <S, A extends Action<any>>(
  reducer: Reducer<S, A>,
  preloadedState: PreloadedState<S> | undefined
) => {
  const store = {
    ...createStore(reducer, preloadedState),
    routerOptions: {
      isServer: false,
      enhancedRoutes: {},
      ...options,
    },
  }

  const newDispatch = compose(middleware(history, handlers, debug)(store))(
    store.dispatch as any
  )
  ;((store as unknown) as Store<
    S & IonRouterState,
    (typeof store extends Store<any, infer Act> ? Act : never) &
      IonRouterActions
  > &
    IonRouterOptions).dispatch = newDispatch
  return (store as unknown) as Store<
    S & IonRouterState,
    (typeof store extends Store<any, infer Act> ? Act : never) &
      IonRouterActions
  > &
    IonRouterOptions
}

export default enhancer
