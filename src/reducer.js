import * as types from './types'

const defaultState = {
  location: {
    pathname: '',
    search: '',
    hash: ''
  },
  matchedRoutes: [],
  routes: {
    ids: [],
    routes: {},
  }
}

export default (state = defaultState, action) => {
  if (!action || !action.type) return state
  let route
  let name
  let ids
  let routes
  switch (action.type) {
    case types.ROUTE:
      if (action.payload.pathname === state.location.pathname
        && action.payload.search === state.location.search
        && action.payload.hash === state.location.hash) return state
      return {
        ...state,
        location: { ...action.payload },
      }
    case types.SET_PARAMS:
      return {
        ...state,
        routes: {
          ...state.routes,
          routes: {
            ...state.routes.routes,
            [action.payload.route]: {
              ...state.routes.routes[action.payload.route],
              params: action.payload.params,
              state: action.payload.state
            }
          }
        }
      }
    case types.MATCH_ROUTES:
      return {
        ...state,
        matchedRoutes: action.payload
      }
    case types.EDIT_ROUTE:
      route = action.payload
      return {
        ...state,
        routes: {
          ids: [...state.routes.ids, route.name],
          routes: {
            ...state.routes.routes,
            [route.name]: route
          }
        }
      }
    case types.REMOVE_ROUTE:
      name = action.payload
      ids = [...state.routes.ids]
      routes = { ...state.routes.routes }
      ids.splice(ids.indexOf(name), 1)
      delete routes[name]
      return {
        ...state,
        routes: {
          ids,
          routes,
        }
      }
    default:
      return state
  }
}
