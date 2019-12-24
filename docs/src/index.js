import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, combineReducers, compose } from 'redux'
import { Provider } from 'react-redux'
import Routes from 'ion-router/Routes'
import * as ion from 'ion-router'
import routing from 'ion-router/reducer'
import examples from './redux/example'
import exampleSetup from './examples'

import App from './App'
import './index.css'

const exampleReducers = Object.keys(exampleSetup).reduce((reducers, key) => ({
  ...reducers,
  [key]: exampleSetup[key].reducer
}), {})
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose // eslint-disable-line
const reducer = combineReducers({
  routing,
  examples,
  ...exampleReducers,
})


// set up the router and create the store
const enhancer = ion.makeRouterStoreEnhancer()
const store = createStore(reducer, undefined,
  composeEnhancers(enhancer))

ReactDOM.render(
  <Provider store={store}>
    <Routes store={store}>
      <App />
    </Routes>
  </Provider>,
  document.getElementById('root')
)
