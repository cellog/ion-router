import React, { Component } from 'react'
import PropTypes from 'prop-types'
import createHistory from 'history/createMemoryHistory'
import { createStore, applyMiddleware, combineReducers, compose } from 'redux'
import { createProvider, connect } from 'react-redux-custom-store'
import makeRouter, { makeRouterMiddleware } from 'ion-router'
import routing from 'ion-router/reducer'

import Browser from './Browser'
import ShowSource from './ShowSource'
import examples from '../examples'

const Provider = createProvider('examples')
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? // eslint-disable-line
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ name: 'examples' }) // eslint-disable-line
  : compose

class Example extends Component {
  static propTypes = {
    example: PropTypes.string.isRequired
  }

  constructor(props) {
    super(props)
    this.history = createHistory({
      initialEntries: ['/']
    })
    const reducer = combineReducers({
      ...examples[props.example].reducer,
      routing
    })


    // set up the router and create the store
    const routerMiddleware = makeRouterMiddleware(this.history)
    this.store = createStore(reducer, undefined,
      composeEnhancers(applyMiddleware(routerMiddleware)))
    makeRouter(connect, this.store)
  }

  render() {
    return (
      <div className="example">
        <div className="browser-panel">
          <Provider store={this.store}>
            <Browser Content={examples[this.props.example].component} />
          </Provider>
        </div>
        <div className="source-panel">
          <ShowSource source={examples[this.props.example].source} />
        </div>
      </div>
    )
  }
}

export default Example
