import { createPath, LocationDescriptorObject } from 'history'

import * as actions from './actions'
import * as selectors from './selectors'
import * as enhancers from './enhancers'
import reducer, { IonRouterState } from './reducer'
import { ActionHandler, HandlerResult } from './middleware'

export const filter = (
  enhancedRoutes: enhancers.EnhancedRoutes,
  path: string
) => (name: string) => enhancedRoutes[name]['@parser'].match(path)

export const diff = (main: string[], second: string[]) =>
  main.filter(name => second.indexOf(name) === -1)

export function changed<S extends { [o: string]: any }>(
  oldItems: S,
  newItems: S
): (keyof S)[] {
  return Object.keys({ ...newItems, ...oldItems }).filter(
    key =>
      !Object.prototype.hasOwnProperty.call(oldItems, key) ||
      oldItems[key] !== newItems[key]
  )
}

export function urlFromState(
  enhancedRoutes: enhancers.EnhancedRoutes,
  state: selectors.FullStateWithRouter
) {
  const toDispatch: actions.IonRouterActions[] = []
  const updatedRoutes: enhancers.EnhancedRoutes = {}
  let url: false | string = false
  const currentUrl = createPath(state.routing.location)
  state.routing.matchedRoutes.forEach(route => {
    const s = enhancedRoutes[route]
    const newParams = s.paramsFromState(state)
    const newState = s.stateFromParams(newParams)
    if (changed(s.params, newParams).length) {
      updatedRoutes[route] = {
        ...enhancedRoutes[route],
        params: newParams,
        state: newState,
      }
      toDispatch.push(actions.setParamsAndState(route, newParams, newState))
      if (!url) url = s['@parser'].reverse(newParams)
    }
  })
  const tempState: selectors.FullStateWithRouter = {
    ...state,
    routing: {
      ...state.routing,
      routes: {
        ...state.routing.routes,
        routes: {
          ...state.routing.routes.routes,
          ...Object.keys(updatedRoutes).reduce<
            IonRouterState['routes']['routes']
          >(
            (routes, key) => ({
              ...routes,
              [key]: {
                ...state.routing.routes.routes[key],
                params: updatedRoutes[key].params,
                state: updatedRoutes[key].state,
              },
            }),
            {}
          ),
        },
      },
    },
  }
  const { toDispatch: t } = matchRoutesHelper(
    enhancedRoutes,
    tempState,
    actions.route({
      pathname: url || currentUrl,
      search: '',
      state: false,
      hash: '',
    }),
    false
  )
  if (url && url !== currentUrl) toDispatch.push(actions.push(url))
  return {
    newEnhancedRoutes: { ...enhancedRoutes, ...updatedRoutes },
    toDispatch: [...toDispatch, ...t],
  }
}

export function getStateUpdates<
  ReduxState extends selectors.FullStateWithRouter,
  Params extends { [key: string]: string },
  ParamsState extends { [P in keyof Params]: any },
  Action extends { type: string; [key: string]: any },
  S extends enhancers.EnhancedRoute<ReduxState, Params, ParamsState, Action>
>(s: S, newState: ParamsState) {
  const oldState = s.state
  const changes = changed(oldState, newState)
  const update = s.updateState
  return changes
    .map(key => (update[key] ? update[key]!(newState[key], newState) : false))
    .filter(t => t) as (Action | Action[])[]
}

export function updateState<
  ReduxState extends selectors.FullStateWithRouter,
  Params extends { [key: string]: string },
  ParamsState extends { [P in keyof Params]: any },
  Action extends { type: string; [key: string]: any },
  S extends enhancers.EnhancedRoute<ReduxState, Params, ParamsState, Action>
>(s: S, params: Params, state: selectors.FullStateWithRouter) {
  const newState = s.stateFromParams(params, state)
  const changes = getStateUpdates<ReduxState, Params, ParamsState, Action, S>(
    s,
    newState
  )
  const acts: (Action | actions.SetParamsAndStateAction)[] = []
  const updatedRoutes: {
    [name: string]: S
  } = {}
  if (changes.length) {
    acts.push(actions.setParamsAndState(s.name, params, newState))
    updatedRoutes[s.name] = {
      ...s,
      params,
      state: newState,
    }
    for (let i = 0; i < changes.length; i++) {
      if ((changes[i] as Action).type)
        (changes[i] as Action[]) = [changes[i] as Action]
      ;(changes[i] as Action[]).forEach(event => acts.push(event))
    }
  }
  return {
    acts,
    updatedRoutes,
  }
}

export function template<
  ReduxState extends selectors.FullStateWithRouter,
  Params extends { [key: string]: string },
  ParamsState extends { [P in keyof Params]: any },
  Action extends { type: string; [key: string]: any },
  S extends enhancers.EnhancedRoute<ReduxState, Params, ParamsState, Action>
>(s: S, params: Params) {
  return s.exitParams instanceof Function
    ? { ...s.exitParams(params) }
    : { ...s.exitParams }
}

export const exitRoute = <
  ReduxState extends selectors.FullStateWithRouter,
  Params extends { [key: string]: string },
  ParamsState extends { [P in keyof Params]: any },
  Action extends { type: string; [key: string]: any },
  S extends enhancers.EnhancedRoute<ReduxState, Params, ParamsState, Action>,
  E extends {
    [key: string]: S
  }
>(
  state: ReduxState,
  enhanced: E,
  name: keyof E
) => {
  const s = enhanced[name]
  const params = s.params
  let parentParams = params
  let a: S = s
  while (a.parent) {
    const parent = enhanced[a.parent]
    if (!selectors.matchedRoute(state, parent.name)) {
      // we have left a child route and its parent
      parentParams = {
        ...parentParams,
        ...template<ReduxState, Params, ParamsState, Action, S>(
          parent,
          parentParams
        ),
      }
    }
    a = parent
  }
  parentParams = {
    ...parentParams,
    ...template<ReduxState, Params, ParamsState, Action, S>(s, parentParams),
  }
  return updateState<ReduxState, Params, ParamsState, Action, S>(
    s,
    parentParams,
    state
  )
}

export function stateFromLocation(
  enhancedRoutes: enhancers.EnhancedRoutes,
  state: selectors.FullStateWithRouter,
  location: string
) {
  const names = Object.keys(enhancedRoutes)
  let ret: ReturnType<typeof updateState>['acts'] = []
  let n = enhancedRoutes
  for (let i = 0; i < names.length; i++) {
    const s = enhancedRoutes[names[i]]
    const params = s['@parser'].match(location)
    if (params) {
      const { updatedRoutes, acts } = updateState(s, params, state)
      n = { ...n, ...updatedRoutes }
      ret = [...ret, ...acts]
    } else if (state.routing.matchedRoutes.includes(names[i])) {
      const { updatedRoutes, acts } = exitRoute(state, n, names[i])
      ret = [...ret, ...acts]
      n = { ...n, ...updatedRoutes }
    }
  }
  return {
    updatedRoutes: n,
    acts: ret,
  }
}

export const matchRoutesHelper: ActionHandler<actions.RouteAction> = (
  enhancedRoutes: enhancers.EnhancedRoutes,
  state: selectors.FullStateWithRouter,
  action: actions.RouteAction,
  updateParams: boolean = true
): HandlerResult => {
  const toDispatch: (
    | { type: string; [key: string]: any }
    | actions.IonRouterActions
  )[] = []
  const lastMatches = state.routing.matchedRoutes
  const path = createPath(action.payload)
  const matchedRoutes = state.routing.routes.ids.filter(
    filter(enhancedRoutes, path)
  )
  const exiting = diff(lastMatches, matchedRoutes)
  const entering = diff(matchedRoutes, lastMatches)
  if (exiting.length || entering.length) {
    toDispatch.push(actions.matchRoutes(matchedRoutes))
    if (exiting.length) toDispatch.push(actions.exitRoutes(exiting))
    if (entering.length) toDispatch.push(actions.enterRoutes(entering))
  }
  if (updateParams) {
    const { updatedRoutes: newEnhancedRoutes, acts } = stateFromLocation(
      enhancedRoutes,
      state,
      path
    )
    acts.forEach(act => toDispatch.push(act))
    return {
      newEnhancedRoutes,
      toDispatch,
    }
  }
  return {
    newEnhancedRoutes: enhancedRoutes,
    toDispatch,
  }
}

function stateWithRoutes<S extends { [key: string]: any }>(
  state: S,
  action: actions.IonRouterActions
): selectors.FullStateWithRouter {
  return {
    ...state,
    routing: reducer(state.routing, action),
  }
}

function routeMatching<S extends { [key: string]: any }>(
  newEnhancedRoutes: enhancers.EnhancedRoutes,
  state: S,
  action: actions.IonRouterActions
) {
  return matchRoutesHelper(
    newEnhancedRoutes,
    stateWithRoutes(state, action),
    actions.route(state.routing.location)
  ).toDispatch
}

export const makeRoute: ActionHandler<actions.EditRouteAction<
  selectors.FullStateWithRouter,
  any,
  any,
  any
>> = (
  enhancedRoutes: enhancers.EnhancedRoutes,
  state: selectors.FullStateWithRouter,
  action: actions.EditRouteAction<selectors.FullStateWithRouter, any, any, any>
) => {
  const newEnhancedRoutes = enhancers.save(action.payload, enhancedRoutes)
  return {
    newEnhancedRoutes,
    toDispatch: routeMatching(newEnhancedRoutes, state, action),
  }
}

export const batchRoutesHelper: ActionHandler<actions.BatchAddRoutesAction> = (
  enhancedRoutes: enhancers.EnhancedRoutes,
  state: selectors.FullStateWithRouter,
  action: actions.BatchAddRoutesAction
): HandlerResult => {
  const newEnhancedRoutes: enhancers.EnhancedRoutes = {
    ...enhancedRoutes,
    ...action.payload.ids.reduce(
      (routes, name) => ({
        ...routes,
        [name]: enhancers.enhanceRoute(action.payload.routes[name]),
      }),
      {}
    ),
  }
  return {
    newEnhancedRoutes,
    toDispatch: routeMatching(newEnhancedRoutes, state, action),
  }
}

export const removeRouteHelper: ActionHandler<actions.RemoveRouteAction> = (
  enhancedRoutes: enhancers.EnhancedRoutes,
  _state: selectors.FullStateWithRouter,
  action: actions.RemoveRouteAction
) => {
  const newRoutes = { ...enhancedRoutes }
  delete newRoutes[action.payload]
  return {
    newEnhancedRoutes: newRoutes,
    toDispatch: [],
  }
}

export const batchRemoveRoutesHelper: ActionHandler<actions.BatchRemoveRoutesAction> = (
  enhancedRoutes: enhancers.EnhancedRoutes,
  _state: selectors.FullStateWithRouter,
  action
) => {
  const newRoutes = { ...enhancedRoutes }
  action.payload.ids.forEach(name => delete newRoutes[name])
  return {
    newEnhancedRoutes: newRoutes,
    toDispatch: [],
  }
}
