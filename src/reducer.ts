import * as types from './types'
import {
  stateRouteShape,
  IonRouterActions,
  RouteParams,
  RouteState,
} from './actions'

export interface IonRouterState {
  location: {
    pathname: string
    search: string
    hash: string
  }
  matchedRoutes: string[]
  routes: {
    ids: string[]
    routes: {
      [id: string]: {
        name: string
        path: string
        parent: string | undefined
        params: RouteParams
        state: RouteState
      }
    }
  }
}

const defaultState: IonRouterState = {
  location: {
    pathname: '',
    search: '',
    hash: '',
  },
  matchedRoutes: [],
  routes: {
    ids: [],
    routes: {},
  },
}

export default (
  state: IonRouterState = defaultState,
  action?: IonRouterActions
) => {
  if (!action || !action.type) return state
  let route
  let name
  let ids
  let routes
  switch (action.type) {
    case types.ROUTE:
      if (
        action.payload.pathname === state.location.pathname &&
        action.payload.search === state.location.search &&
        action.payload.hash === state.location.hash
      )
        return state
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
              state: action.payload.state,
            },
          },
        },
      }
    case types.MATCH_ROUTES:
      return {
        ...state,
        matchedRoutes: action.payload,
      }
    case types.BATCH_ROUTES:
      return {
        ...state,
        routes: {
          ids: [...state.routes.ids, ...action.payload.ids],
          routes: {
            ...state.routes.routes,
            ...action.payload.ids.reduce((defs, n) => {
              const r = action.payload.routes[n]
              return {
                ...defs,
                [r.name]: stateRouteShape(r),
              }
            }, {}),
          },
        },
      }
    case types.EDIT_ROUTE:
      route = action.payload
      return {
        ...state,
        routes: {
          ids: [...state.routes.ids, route.name],
          routes: {
            ...state.routes.routes,
            [route.name]: {
              name: route.name,
              path: route.path,
              parent: route.parent,
              params: route.params,
              state: route.state,
            },
          },
        },
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
        },
      }
    case types.BATCH_REMOVE_ROUTES:
      ids = state.routes.ids.filter(id => !action.payload.ids.includes(id))
      routes = ids.reduce(
        (newroutes, id) => ({ ...newroutes, [id]: state.routes.routes[id] }),
        {}
      )
      return {
        ...state,
        routes: {
          ids,
          routes,
        },
      }
    default:
      return state
  }
}
