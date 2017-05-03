import React, { Component } from 'react'
import PropTypes from 'prop-types'
import createHistory from 'history/createMemoryHistory'
import { createStore, combineReducers, compose } from 'redux'
import { connect, Provider } from 'react-redux'
import makeRouter, { makeRouterStoreEnhancer } from 'ion-router'
import routing from 'ion-router/reducer'

import Browser from './Browser'
import ShowSource from './ShowSource'
import examples from '../examples'

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
    const enhancer = makeRouterStoreEnhancer(this.history)

    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? // eslint-disable-line
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ name: `examples: ${props.example}` }) // eslint-disable-line
      : compose
    this.store = createStore(reducer, undefined,
      composeEnhancers(enhancer))
    makeRouter(connect, this.store)
    this.state = {
      showBrowser: true
    }
  }

  render() {
    return (
      <div className="example">
        <div className="browser-panel">
          <Provider store={this.store}>
            {this.state.showBrowser ?
              <Browser
                Content={examples[this.props.example].component}
                showSource={() => this.setState({ showBrowser: false })}
              /> : <div /> }
          </Provider>
        </div>
        <div className="source-panel">
          <button className="mobile-showsource" onClick={() => this.setState({ showBrowser: true })}>Show Example</button>
          <ShowSource source={examples[this.props.example].source} />
        </div>
      </div>
    )
  }
}

export default Example
