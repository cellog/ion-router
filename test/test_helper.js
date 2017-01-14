import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import reducer from '../src/reducer';
import teaspoon from 'teaspoon'

function renderComponent(ComponentClass, props = {}, state = {}, returnStore = false) {
  const log = []
  const logger = store => next => action => {
    log.push(action)
    return next(action)
  }

  class Tester extends Component {
    constructor(props) {
      super(props)
      this.state = props
    }
    componentWillReceiveProps(props) {
      if (props !== this.props)
      this.setState(props)
    }
    render() {
      return (
        <Provider store={store}>
          <ComponentClass {...this.state} />
        </Provider>
      )
    }
  }

  const store = createStore(combineReducers({routing: reducer}), state, applyMiddleware(logger));
  const componentInstance = teaspoon(
    <Tester {...props} />
  ).render()
  const ret = componentInstance
  if (returnStore) {
    return [ret, store, log];
  }
  return ret;
}

export { renderComponent }
