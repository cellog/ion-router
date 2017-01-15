import React, { Component } from 'react'
import teaspoon from 'teaspoon'
import { Provider } from 'react-redux'
import { createStore, combineReducers, applyMiddleware } from 'redux'
import reducer from '../src/reducer'

const fakeWeekReducer = (state = 1) => state

function renderComponent(ComponentClass, props = {}, state = {}, returnStore = false) {
  const log = []
  const logger = store => next => action => { // eslint-disable-line
    log.push(action)
    return next(action)
  }

  const store = createStore(combineReducers({ routing: reducer, week: fakeWeekReducer }),
    state, applyMiddleware(logger))

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
        <Provider store={store}>
          <ComponentClass {...this.state} />
        </Provider>
      )
    }
  }
  const componentInstance = teaspoon(
    <Tester {...props} />
  ).render()
  const ret = componentInstance
  if (returnStore) {
    return [ret, store, log]
  }
  return ret
}

export { renderComponent } // eslint-disable-line
