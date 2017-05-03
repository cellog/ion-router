import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, combineReducers, compose } from 'redux'
import { createProvider } from 'react-redux-custom-store'
import * as ion from 'ion-router'
import routing from 'ion-router/reducer'
import examples from './redux/example'

import App from './App'
import './index.css'

const Provider = createProvider('mainStore')
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose // eslint-disable-line
const reducer = combineReducers({
  routing,
  examples
})


// set up the router and create the store
const enhancer = ion.makeRouterStoreEnhancer()
const store = createStore(reducer, undefined,
  composeEnhancers(enhancer))

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
