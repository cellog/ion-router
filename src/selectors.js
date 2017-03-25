export function matchedRoute(state, name, strict = false) {
  if (Array.isArray(name)) {
    const matches = state.routing.matchedRoutes.filter(route => name.includes(route))
    if (strict) return matches.length === name.length
    return !!matches.length
  }
  return state.routing.matchedRoutes.includes(name)
}

export function noMatches(state) {
  return state.routing.matchedRoutes.length === 0
}

export function oldState(state, route) {
  return state.routing.routes.routes[route].state
}

export function oldParams(state, route) {
  return state.routing.routes.routes[route].params
}

export function matchedRoutes(state) {
  return state.routing.matchedRoutes
}

export function location(state) {
  return state.routing.location
}

export function stateExists(state, template, fullState = undefined) {
  const full = fullState || state
  const keys = Object.keys(template)
  return keys.reduce((valid, key) => {
    if (!valid) return false
    if (template[key] instanceof Function) {
      return template[key](state[key], full)
    }
    switch (typeof template[key]) {
      case 'object' :
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
      default :
        return typeof template[key] === typeof state[key]
    }
  }, true)
}
