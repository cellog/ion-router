import { IonRouterState } from './reducer'

export interface FullStateWithRouter {
  [stateSlice: string]: any
  routing: IonRouterState
}

export function matchedRoute(
  state: FullStateWithRouter,
  name: string | string[],
  strict = false
) {
  if (Array.isArray(name)) {
    const matches = state.routing.matchedRoutes.filter(route =>
      name.includes(route)
    )
    if (strict) return matches.length === name.length
    return !!matches.length
  }
  return state.routing.matchedRoutes.includes(name)
}

export function noMatches(state: FullStateWithRouter) {
  return state.routing.matchedRoutes.length === 0
}

export function oldState(state: FullStateWithRouter, route: string) {
  return state.routing.routes.routes[route].state
}

export function oldParams(state: FullStateWithRouter, route: string) {
  return state.routing.routes.routes[route].params
}

export function matchedRoutes(state: FullStateWithRouter) {
  return state.routing.matchedRoutes
}

export function location(state: FullStateWithRouter) {
  return state.routing.location
}

export function stateExists(
  state: FullStateWithRouter,
  template: { [key: string]: any },
  fullState: FullStateWithRouter | undefined = undefined
): boolean {
  const full = fullState || state
  const keys = Object.keys(template)
  return keys.reduce((valid, key) => {
    if (!valid) return false
    if (template[key] instanceof Function) {
      return template[key](state[key], full)
    }
    switch (typeof template[key]) {
      case 'object':
        if (template[key] === null) {
          return state[key] === null
        }
        if (Array.isArray(template[key])) {
          return Array.isArray(state[key])
        }
        if (state[key] === undefined && template[key] !== undefined) {
          return false
        }
        return stateExists(state[key], template[key], full)
      default:
        return typeof template[key] === typeof state[key]
    }
  }, true)
}
