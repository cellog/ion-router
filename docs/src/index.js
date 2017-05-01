import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, applyMiddleware, combineReducers, compose } from 'redux'
import { Provider, connect } from 'react-redux'
import makeRouter, { makeRouterMiddleware } from 'ion-router'
import routing from 'ion-router/reducer'
import examples from './redux/example'

import App from './App'
import './index.css'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose // eslint-disable-line
const reducer = combineReducers({
  routing,
  examples
})


// set up the router and create the store
const routerMiddleware = makeRouterMiddleware()
const store = createStore(reducer, undefined,
  composeEnhancers(applyMiddleware(routerMiddleware)))
makeRouter(connect, store)

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
