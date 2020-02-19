import React, { Component } from 'react'
import * as rtl from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

import { Provider, connect } from 'react-redux'
import {
  createStore,
  combineReducers,
  applyMiddleware,
  compose,
  Middleware,
  AnyAction,
  Store,
} from 'redux'
import createHistory from 'history/createMemoryHistory'

import reducer from '../src/reducer'
import storeEnhancer, { IonRouterOptions } from '../src/storeEnhancer'
import { FullStateWithRouter, IonRouterActions } from '../src'

const fakeWeekReducer = (state = 1) => state

function sagaStore<S extends FullStateWithRouter>(
  state: S,
  reducers = { routing: reducer, week: fakeWeekReducer },
  middleware: Middleware[] = [],
  enhancer = storeEnhancer(
    createHistory({
      initialEntries: ['/'],
    })
  )
) {
  const log: (IonRouterActions | AnyAction)[] = []
  const logger: Middleware = _store => next => action => {
    log.push(action)
    return next(action)
  }

  const store = createStore(
    combineReducers(reducers),
    state,
    compose(enhancer as any, applyMiddleware(...middleware, logger))
  )
  return {
    log,
    store: (store as unknown) as Store<S, IonRouterActions> & IonRouterOptions,
  }
}

function renderComponent(
  ComponentClass,
  props = {},
  state = undefined,
  returnStore = false,
  mySagaStore = sagaStore(state),
  intoDocument: false | HTMLElement = false
) {
  class Tester extends Component {
    constructor(props) {
      super(props)
      this.state = props
    }
    componentDidUpdate(props) {
      if (props !== this.props) {
        this.setState(this.props)
      }
    }
    render() {
      return (
        <Provider store={mySagaStore.store}>
          <ComponentClass {...this.state} />
        </Provider>
      )
    }
  }
  let ret
  rtl.act(() => {
    ret = rtl.render(
      <Tester {...props} />,
      intoDocument ? { container: intoDocument } : undefined
    )
  })
  const { rerender } = ret
  ret.rerender = newProps => {
    rtl.act(() => {
      rerender(
        <Tester {...newProps} />,
        intoDocument ? { container: intoDocument } : undefined
      )
    })
  }
  if (returnStore) {
    return [ret, mySagaStore.store, mySagaStore.log]
  }
  return ret
}

export { renderComponent, connect, sagaStore } // eslint-disable-line
