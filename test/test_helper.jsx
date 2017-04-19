import React, { Component } from 'react'
import teaspoon from 'teaspoon'
import { Provider, connect } from 'react-redux'
import { createStore, combineReducers, applyMiddleware } from 'redux'
import reducer from '../src/reducer'

const fakeWeekReducer = (state = 1) => state

function sagaStore(state, reducers = { routing: reducer, week: fakeWeekReducer }, middleware = []) {
  const log = []
  const logger = store => next => action => { // eslint-disable-line
    log.push(action)
    return next(action)
  }

  const store = createStore(combineReducers(reducers),
    state, applyMiddleware(...middleware, logger))
  return {
    log,
    store,
  }
}

function renderComponent(ComponentClass, props = {}, state = {}, returnStore = false,
  sagaStore = false, intoDocument = false) {
  let store
  let log
  if (!sagaStore) {
    log = []
    const logger = store => next => action => { // eslint-disable-line
      log.push(action)
      return next(action)
    }

    store = createStore(combineReducers({ routing: reducer, week: fakeWeekReducer }),
      state, applyMiddleware(logger))
  }

  class Tester extends Component {
    constructor(props) {
      super(props)
      this.state = props
    }
    componentWillReceiveProps(props) {
      if (props !== this.props) {
        this.setState(props)
      }
    }
    render() {
      return (
        <Provider store={sagaStore ? sagaStore.store : store}>
          <ComponentClass {...this.state} />
        </Provider>
      )
    }
  }
  const componentInstance = teaspoon(
    <Tester {...props} />
  ).render(intoDocument)
  const ret = componentInstance
  if (returnStore) {
    return [ret, store, log]
  }
  return ret
}

export { renderComponent, connect, sagaStore } // eslint-disable-line
