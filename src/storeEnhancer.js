import createBrowserHistory from 'history/createBrowserHistory'
import { compose } from 'redux'

import middleware, { actionHandlers } from './middleware'

export default (history = createBrowserHistory(),
                handlers = actionHandlers,
                debug = false, options = {}) =>
  createStore => (reducer, preloadedState) => {
    const store = {
      ...createStore(reducer, preloadedState),
      routerOptions: {
        server: false,
        enhancedRoutes: {},
        ...options
      }
    }
    store.dispatch = compose(middleware(history, handlers, debug)(store))(store.dispatch)
    return store
  }
