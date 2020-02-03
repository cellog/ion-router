import * as react from 'react'
import { Dispatch, AnyAction, Store } from 'redux'
import { IonRouterState } from './reducer'
import { FullStateWithRouter } from './selectors'
import { IonRouterOptions } from './storeEnhancer'
import { DeclareRoute } from './enhancers'

export interface RouterContext {
  dispatch: Dispatch<any>
  routes: IonRouterState['routes']['routes']
  addRoute: <
    ReduxState extends FullStateWithRouter,
    Params extends { [key: string]: string },
    ParamsState extends { [key: string]: any },
    Action extends { type: string; [key: string]: any }
  >(
    route: DeclareRoute<ReduxState, Params, ParamsState, Action>
  ) => void
  store: Store<FullStateWithRouter, AnyAction> & IonRouterOptions
}

export const Context = react.createContext<RouterContext | null>(null)

export default Context
