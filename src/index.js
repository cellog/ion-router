import { call, fork, put } from 'redux-saga/effects'
import createBrowserHistory from 'history/createBrowserHistory'
import { createPath } from 'history'
import historyChannel from './historyChannel'
import routerReducer from './reducer'
import * as actions from './actions'
import * as sagas from './sagas'
import { connectLink } from './Link'
import { connectRoutes } from './Routes'
import { connectToggle } from './Toggle'

export const options = {
  server: false,
  enhancedRoutes: {},
  pending: false,
  resolve: false,
}

export const setServer = (val = true) => options.server = val

export const pending = opts => opts.pending

export const begin = (opts) => {
  const o = opts
  if (!o.pending) {
    o.pending = new Promise((resolve) => {
      o.resolve = resolve
    })
  }
  return true
}

export const commit = (opts) => {
  const o = opts
  o.pending = false
  o.resolve(false)
  return false
}

export function makePath(name, params) {
  if (!options.enhancedRoutes[name]) return false
  return options.enhancedRoutes[name]['@parser'].reverse(params)
}

export function matchesPath(route, locationOrPath) {
  if (!options.enhancedRoutes[route]) return false
  return options.enhancedRoutes[route]['@parser'].match(locationOrPath.pathname ? createPath(locationOrPath) : locationOrPath)
}

export { routerReducer }

export const onServer = () => options.server
export const setEnhancedRoutes = (r) => {
  options.enhancedRoutes = r
}

export function *router(connect, routeDefinitions, history, channel, isServer) {
  options.server = !!isServer
  yield [
    call(connectLink, connect),
    call(connectRoutes, connect),
    call(connectToggle, connect),

    fork(sagas.routeMonitor, options, history),

    fork(sagas.stateMonitor, options),
    fork(sagas.browserListener, history),
    fork(sagas.locationListener, channel, options),
  ]
  if (routeDefinitions.length) {
    yield put(actions.batchRoutes(routeDefinitions))
  }
  yield put(actions.route(history.location))
}

export default (sagaMiddleware,
                connect,
                routeDefinitions,
                history = createBrowserHistory(),
                isServer = false,
                channel = historyChannel(history)) => {
  sagaMiddleware.run(router, connect, routeDefinitions, history, channel, isServer)
}
