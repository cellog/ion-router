import * as types from './types'

export function createRoute(params) {
  return {
    type: types.CREATE_ROUTE,
    payload: params
  }
}

export function push(details, state = undefined) {
  return {
    type: types.ACTION,
    payload: {
      verb: 'push',
      route: details,
      state
    }
  }
}

export function replace(details, state = undefined) {
  return {
    type: types.ACTION,
    payload: {
      verb: 'replace',
      route: details,
      state
    }
  }
}

export function go(details) {
  return {
    type: types.ACTION,
    payload: {
      verb: 'go',
      route: details
    }
  }
}

export function goBack() {
  return {
    type: types.ACTION,
    payload: {
      verb: 'goBack'
    }
  }
}

export function goForward() {
  return {
    type: types.ACTION,
    payload: {
      verb: 'goForward'
    }
  }
}

export function matchRoutes(routes) {
  return {
    type: types.MATCH_ROUTES,
    payload: routes
  }
}

export function route(location) {
  return {
    type: types.ROUTE,
    payload: location
  }
}

export function addRoute(name, url) {
  return {
    type: types.EDIT_ROUTE,
    payload: {
      name,
      url,
      params: {},
      state: {}
    }
  }
}

export function removeRoute(name) {
  return {
    type: types.REMOVE_ROUTE,
    payload: name
  }
}

export function setParamsAndState(details, params, state) {
  return {
    type: types.SET_PARAMS,
    payload: {
      route: details,
      params,
      state
    }
  }
}

export function exitRoutes(routes) {
  return {
    type: types.EXIT_ROUTES,
    payload: routes
  }
}

export function enterRoutes(routes) {
  return {
    type: types.ENTER_ROUTES,
    payload: routes
  }
}