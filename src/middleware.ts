import { createBrowserHistory } from 'history'
import { createPath } from 'history'
import invariant from 'invariant'

import * as types from './types'
import * as actions from './actions'
import * as helpers from './helpers'
import { Store, Action } from 'redux'
import { IonRouterOptions, assertEnhancedStore } from './storeEnhancer'
import { EnhancedRoutes } from './enhancers'
import { FullStateWithRouter } from './selectors'

export type MiddlewareListener = <
  S extends FullStateWithRouter,
  A extends Action<any>,
  T extends any
>(
  store: Store<S, A> & IonRouterOptions,
  next: (action: A) => T,
  action: A
) => T

function ignore<S, A extends Action<any>>(
  store: Store<S, A>,
  next: (action: A) => any,
  action: A
) {
  return next(action)
}

export const ignoreKey: '#@#$@$#@$@#$@#$@#$@#$@#$@#$@#$@#$@#$@#$ignore' = '#@#$@$#@$@#$@#$@#$@#$@#$@#$@#$@#$@#$@#$ignore' as const

function pass(newEnhancedRoutes: EnhancedRoutes) {
  return {
    newEnhancedRoutes,
    toDispatch: [],
  }
}

export interface HandlerResult {
  newEnhancedRoutes: EnhancedRoutes
  toDispatch: (
    | actions.IonRouterActions
    | { type: string; [key: string]: any }
  )[]
}

export type ActionHandler<A extends actions.IonRouterActions> = (
  routes: EnhancedRoutes,
  state: FullStateWithRouter,
  action: A,
  updateParams?: boolean
) => HandlerResult

export interface ActionHandlers {
  '#@#$@$#@$@#$@#$@#$@#$@#$@#$@#$@#$@#$@#$ignore': MiddlewareListener
  '*': ActionHandler<any>
  '@@ion-router/ACTION': ActionHandler<
    actions.AllUrlActions<actions.ActionVerbs>
  >
  '@@ion-router/EDIT_ROUTE': ActionHandler<
    actions.EditRouteAction<FullStateWithRouter, any, any, any>
  >
  '@@ion-router/BATCH_ROUTES': ActionHandler<actions.BatchAddRoutesAction>
  '@@ion-router/REMOVE_ROUTE': ActionHandler<actions.RemoveRouteAction>
  '@@ion-router/BATCH_REMOVE_ROUTES': ActionHandler<
    actions.BatchRemoveRoutesAction
  >
  '@@ion-router/ROUTE': ActionHandler<actions.RouteAction>
}

// every action handler accepts enhanced routes, state, and action
// and returns enhanced routes and a list of actions to send
// so all of them are pure
export const actionHandlers: ActionHandlers = {
  [ignoreKey]: ignore,

  [types.ACTION]: pass,
  [types.EDIT_ROUTE]: helpers.makeRoute,
  [types.BATCH_ROUTES]: helpers.batchRoutesHelper,
  [types.REMOVE_ROUTE]: helpers.removeRouteHelper,
  [types.BATCH_REMOVE_ROUTES]: helpers.batchRemoveRoutesHelper,

  [types.ROUTE]: helpers.matchRoutesHelper,
  '*': helpers.urlFromState,
}

function invariantHelper(
  type: string,
  condition: any,
  message: string
): asserts condition {
  invariant(
    condition,
    `router middleware action handler for action type "${type}" does not ${message}`
  )
}

export function processHandler(
  handler: ActionHandler<any>,
  routes: EnhancedRoutes,
  state: FullStateWithRouter,
  action: any
) {
  const info = handler(routes, state, action)
  invariantHelper(
    action.type,
    info !== undefined,
    `return a map { newEnhancedRoutes, toDispatch }`
  )
  invariantHelper(
    action.type,
    info.newEnhancedRoutes !== undefined &&
      info.newEnhancedRoutes !== null &&
      typeof info.newEnhancedRoutes === 'object' &&
      !Array.isArray(info.newEnhancedRoutes),
    'return a map for newEnhancedRoutes'
  )
  invariantHelper(
    action.type,
    Array.isArray(info.toDispatch),
    'return an array for toDispatch'
  )
  invariantHelper(
    action.type,
    info.toDispatch.every(act => act.type),
    'return a toDispatch array with all actions containing a "type" key'
  )
  return info
}

const createMiddleware = (
  history = createBrowserHistory(),
  handlers = actionHandlers,
  debug = false
) => {
  let lastLocation = createPath(history.location)
  let activeListener: MiddlewareListener = listen
  const myHandlers = {
    ...handlers,
  }

  function isKnownAction(
    a: string
  ): a is Exclude<keyof ActionHandlers, typeof ignoreKey> {
    return Object.keys(myHandlers).includes(a)
  }

  function listen<A extends Action<any>, T extends any>(
    store: Store<FullStateWithRouter, A> & IonRouterOptions,
    next: (action: A) => T,
    action: A
  ): T {
    const opts = store.routerOptions
    const handler: ActionHandler<any> = isKnownAction(action.type)
      ? myHandlers[action.type]
      : myHandlers['*']
    const state = store.getState()
    activeListener = myHandlers[ignoreKey] || ignore
    try {
      if (handler !== myHandlers['*']) {
        const info = processHandler(handler, opts.enhancedRoutes, state, action)
        const ret = next(action)
        info.toDispatch.forEach(act => store.dispatch(act as A))
        opts.enhancedRoutes = info.newEnhancedRoutes
        return ret
      }
      const ret = next(action)
      const info = processHandler(
        handler,
        opts.enhancedRoutes,
        store.getState(),
        action
      )
      opts.enhancedRoutes = info.newEnhancedRoutes
      if (debug && info.toDispatch.length) {
        console.info(`ion-router PROCESSING: ${action.type}`) // eslint-disable-line
        console.info(`dispatching: `, info.toDispatch) // eslint-disable-line
      }
      info.toDispatch.forEach(act => store.dispatch(act as A))
      return ret
    } finally {
      activeListener = listen
    }
  }
  const newStore = <S, A extends Action<any>>(
    store: Store<S, A> & IonRouterOptions
  ) => {
    assertEnhancedStore<S & FullStateWithRouter, A | actions.IonRouterActions>(
      store
    )
    history.listen(location => {
      const a = createPath(location)
      if (a === lastLocation) return
      lastLocation = a
      store.dispatch(actions.route(location))
    })
    store.dispatch(actions.route(history.location))
    return (next: (a: A | actions.IonRouterActions) => any) => (
      action: actions.IonRouterActions
    ) => {
      const ret = activeListener<
        S & FullStateWithRouter,
        A & actions.IonRouterActions,
        any
      >(store as any, next, action as any)
      if (action.type === types.ACTION) {
        if (
          !action.payload.route &&
          action.payload.verb !== 'goBack' &&
          action.payload.verb !== 'goForward'
        ) {
          throw new Error(
            `ion-router action ${action.payload.verb} must be a string or a location object`
          )
        }
        if (!actions.isCallableVerb(action.payload.verb)) return
        switch (action.payload.verb) {
          case 'go':
            history.go(action.payload.distance!)
            break
          case 'goBack':
            history.goBack()
            break
          case 'goForward':
            history.goForward()
            break
          case 'push':
            history.push(action.payload.route!, action.payload.state)
            break
          case 'replace':
            history.replace(action.payload.route!, action.payload.state)
        }
      }
      return ret
    }
  }
  return newStore
}
export default createMiddleware
