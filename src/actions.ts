import * as types from './types'
import { Location, History } from 'history'
import { DeclareRoute } from './enhancers'

export interface IonRouterRoute<
  State = { [key: string]: any },
  Params = { [key: string]: string }
> {
  name: string
  path: string
  parent: string
  params: Params
  state: State
}

export type ActionVerbs = 'push' | 'replace' | 'go' | 'goBack' | 'goForward'
type HistoryKey<K> = K extends keyof History ? K : never
export type ActionHistoryKeys = HistoryKey<ActionVerbs>

export const isCallableVerb = (verb: string): verb is ActionHistoryKeys => {
  return (
    verb === 'push' ||
    verb === 'replace' ||
    verb === 'go' ||
    verb === 'goBack' ||
    verb === 'goForward'
  )
}

export interface RouteParams {
  [key: string]: any
}

export interface RouteState {
  [key: string]: any
}

export type AllUrlActions<T extends ActionVerbs> = T extends ActionVerbs
  ? UrlAction<T>
  : never

export type IonRouterActions =
  | AllUrlActions<ActionVerbs>
  | MatchRoutesAction
  | RouteAction
  | EditRouteAction<any, any, any>
  | RemoveRouteAction
  | ExitRoutesAction
  | SetParamsAndStateAction
  | ExitRoutesAction
  | EnterRoutesAction
  | PendingUpdatesAction
  | CommittedUpdatesAction
  | BatchAddRoutesAction
  | BatchRemoveRoutesAction

export interface UrlAction<Verb extends ActionVerbs> {
  type: '@@ion-router/ACTION'
  payload: {
    verb: Verb
    route?: string
    distance?: number
    state?: any
  }
}

export function stateRouteShape<
  State,
  Params extends { [P in keyof State]: string },
  Action extends { type: string }
>(
  params: DeclareRoute<State, Params, Action>
): EditRouteAction<State, Params, Action>['payload'] {
  return {
    name: params.name,
    path: params.path,
    parent: params.parent,
    params: {} as Params,
    state: {} as State,
  }
}

function makeUrlAction<Verb extends ActionVerbs>(name: Verb) {
  return (details: string, state: any = {}): UrlAction<Verb> => ({
    type: types.ACTION,
    payload: {
      verb: name,
      route: details,
      state,
    },
  })
}

export const push = makeUrlAction('push')
export const replace = makeUrlAction('replace')

export function go(details: number): UrlAction<'go'> {
  return {
    type: types.ACTION,
    payload: {
      verb: 'go',
      distance: details,
    },
  }
}

export function goBack(): UrlAction<'goBack'> {
  return {
    type: types.ACTION,
    payload: {
      verb: 'goBack',
    },
  }
}

export function goForward(): UrlAction<'goForward'> {
  return {
    type: types.ACTION,
    payload: {
      verb: 'goForward',
    },
  }
}

export interface MatchRoutesAction {
  type: '@@ion-router/MATCH_ROUTES'
  payload: string[]
}

export function matchRoutes(routes: string[]): MatchRoutesAction {
  return {
    type: types.MATCH_ROUTES,
    payload: routes,
  }
}

export interface RouteAction {
  type: '@@ion-router/ROUTE'
  payload: Location
}

export function route(location: Location): RouteAction {
  return {
    type: types.ROUTE,
    payload: location,
  }
}

export interface EditRouteAction<
  State,
  Params extends { [P in keyof State]: string },
  Action extends { type: string }
> {
  type: '@@ion-router/EDIT_ROUTE'
  payload: DeclareRoute<State, Params, Action> & {
    params: Params
    state: State
  }
}

export function addRoute<
  State,
  Params extends { [P in keyof State]: string },
  Action extends { type: string }
>(
  params: DeclareRoute<State, Params, Action>
): EditRouteAction<State, Params, Action> {
  return {
    type: types.EDIT_ROUTE,
    payload: stateRouteShape<State, Params, Action>(params),
  }
}

export interface BatchActionBase {
  type: '@@ion-router/BATCH_ROUTES' | '@@ion-router/BATCH_REMOVE_ROUTES'
  payload: {
    ids: string[]
    routes: {
      [name: string]: IonRouterRoute
    }
  }
}

export interface BatchAddRoutesAction extends BatchActionBase {
  type: '@@ion-router/BATCH_ROUTES'
}

export interface BatchRemoveRoutesAction extends BatchActionBase {
  type: '@@ion-router/BATCH_REMOVE_ROUTES'
}

export function batch<A extends BatchActionBase['type']>(
  batchRoutes: IonRouterRoute[],
  type: A
) {
  return {
    type,
    payload: {
      ids: batchRoutes.map(r => r.name),
      routes: batchRoutes.reduce(
        (defs, r) => ({
          ...defs,
          [r.name]: {
            parent: r.parent,
            ...r,
            params: {},
            state: {},
          },
        }),
        {} as {
          [name: string]: IonRouterRoute
        }
      ),
    },
  }
}

export function batchRoutes(routes: IonRouterRoute[]): BatchAddRoutesAction {
  return batch(routes, types.BATCH_ROUTES) as BatchAddRoutesAction
}

export interface RemoveRouteAction {
  type: '@@ion-router/REMOVE_ROUTE'
  payload: string
}

export function removeRoute(name: string): RemoveRouteAction {
  return {
    type: types.REMOVE_ROUTE,
    payload: name,
  }
}

export function batchRemoveRoutes(
  routes: IonRouterRoute[]
): BatchRemoveRoutesAction {
  return batch(routes, types.BATCH_REMOVE_ROUTES) as BatchRemoveRoutesAction
}

export interface SetParamsAndStateAction {
  type: '@@ion-router/SET_PARAMS'
  payload: {
    route: string
    params: any
    state: any
  }
}

export function setParamsAndState(
  route: string,
  params: RouteParams,
  state: RouteState
): SetParamsAndStateAction {
  return {
    type: types.SET_PARAMS,
    payload: {
      route,
      params,
      state,
    },
  }
}

export interface ExitRoutesAction {
  type: '@@ion-router/EXIT_ROUTES'
  payload: string[]
}

export function exitRoutes(routes: string[]): ExitRoutesAction {
  return {
    type: types.EXIT_ROUTES,
    payload: routes,
  }
}

export interface EnterRoutesAction {
  type: '@@ion-router/ENTER_ROUTES'
  payload: string[]
}

export function enterRoutes(routes: string[]): EnterRoutesAction {
  return {
    type: types.ENTER_ROUTES,
    payload: routes,
  }
}

export interface PendingUpdatesAction {
  type: '@@ion-router/PENDING_UPDATES'
  payload: null
}

export function pending(): PendingUpdatesAction {
  return {
    type: types.PENDING_UPDATES,
    payload: null,
  }
}

export interface CommittedUpdatesAction {
  type: '@@ion-router/COMMITTED_UPDATES'
  payload: null
}

export function commit(): CommittedUpdatesAction {
  return {
    type: types.COMMITTED_UPDATES,
    payload: null,
  }
}