import { take, call, fork, cancel, select, put } from 'redux-saga/effects'
import createBrowserHistory from 'history/createBrowserHistory'
import { createPath } from 'history'
import historyChannel from './historyChannel'
import * as types from './types'
import routerReducer from './reducer'
import RouteManager from './RouteManager'
import * as actions from './actions'
import * as selectors from './selectors'

export * from './actions'

const routes = {}

export function getRoutes() {
  return { ...routes }
}

export function makePath(name, params) {
  return routes[name].url(params)
}

export function matchesPath(route, locationOrPath) {
  return routes[route].match(locationOrPath.pathname ? createPath(locationOrPath) : locationOrPath)
}

export { routerReducer, RouteManager }

export function *browserActions(history) {
  while (true) { // eslint-disable-line
    const action = yield take(types.ACTION)
    yield call([history, history[action.payload.verb]], action.payload.route, action.payload.state)
  }
}

export function makeRoute(history, route) {
  routes[route.name] = new RouteManager(history, route)
}

export function *initRoute(history, params) {
  makeRoute(history, params)
  yield put(actions.addRoute(params.name, params.path))
  yield call([routes[params.name], routes[params.name].initState])
  yield fork([routes[params.name], routes[params.name].monitorState])
  const location = createPath(history.location)
  const matched = routes[params.name].match(location)
  if (matched) {
    const matchedRoutes = yield select(selectors.matchedRoutes)
    yield put(actions.matchRoutes([...matchedRoutes, params.name]))
  }
}

export function *listenForRoutes(history) {
  while (true) { // eslint-disable-line
    const params = yield take(types.CREATE_ROUTE)
    yield call(initRoute, history, params.payload)
  }
}

export function *revert(locationChange, lastUrl) {
  switch (locationChange.action) {
    case 'POP' :
      yield put(actions.push(lastUrl))
      break
    default:
      yield put(actions.replace(lastUrl))
  }
}

export function *router(routeDefinitions, history, channel) {
  yield put(actions.route(history.location))
  const browserTask = yield fork(browserActions, history)
  let location = createPath(history.location)
  for (let i = 0; i < routeDefinitions.length; i++) {
    yield* initRoute(history, routeDefinitions[i])
  }

  try {
    while (true) { // eslint-disable-line
      const keys = Object.keys(routes)
      let lastMatches = []
      const locationChange = yield take(channel)
      const path = createPath(locationChange.location)
      if (location !== path) {
        const matchedRoutes = keys
          .filter(name => routes[name].match(path))
        const exiting = lastMatches
          .filter(name => matchedRoutes.indexOf(name) === -1)
        const entering = matchedRoutes
          .filter(name => lastMatches.indexOf(name) === -1)
        let valid = true
        for (let i = 0; i < exiting.length; i++) {
          if (!(yield call(routes[exiting[i]].exit, location, path))) {
            yield call(revert, locationChange, location)
            valid = false
            break
          }
        }
        if (!valid) continue // eslint-disable-line no-continue
        for (let i = 0; i < entering.length; i++) {
          if (!(yield call(routes[entering[i]].enter, location, path))) {
            yield call(revert, locationChange, location)
            valid = false
            break
          }
        }
        if (!valid) continue // eslint-disable-line no-continue

        location = path
        lastMatches = matchedRoutes
        yield put(actions.route(locationChange.location))
        yield put(actions.matchRoutes(matchedRoutes))
        yield keys.map(name => call([routes[name], routes[name].monitorUrl],
          locationChange.location))
      }
    }
  } finally {
    yield cancel(browserTask)
    channel.close()
  }
}

export default (sagaMiddleware,
                routeDefinitions,
                history = createBrowserHistory(),
                channel = historyChannel(history)) => {
  sagaMiddleware.run(router, routeDefinitions, history, channel)
}
