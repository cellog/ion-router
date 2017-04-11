import React, { Component } from 'react'
import createSagaMiddleware, { runSaga } from 'redux-saga'
import * as effects from 'redux-saga/effects'
import * as utils from 'redux-saga/utils'
import teaspoon from 'teaspoon'
import { Provider, connect } from 'react-redux'
import { createStore, combineReducers, applyMiddleware } from 'redux'
import reducer from '../src/reducer'

const fakeWeekReducer = (state = 1) => state

export const tests = Object.keys(utils.asEffect).reduce((effects, name) => ({
  ...effects,
  [name]: effect => utils.is.notUndef(utils.asEffect[name](effect))
}), {
  isPromise: effect => utils.is.promise(effect),
  isHelper: effect => utils.is.helper(effect),
  isIterator: effect => utils.is.iterator(effect),
  takeEvery: effect => utils.is.helper(effect),
  takeLatest: effect => utils.is.helper(effect),
  throttle: effect => utils.is.helper(effect),
  takem: effect => utils.is.notUndef(utils.asEffect.take(effect)) && effect.TAKE.maybe,
  apply: () => false,
  spawn: effect => utils.is.notUndef(utils.asEffect.fork(effect)) && effect.FORK.detached,
})

function sagaStore(state, reducers = { routing: reducer, week: fakeWeekReducer }) {
  const log = []
  const logger = store => next => action => { // eslint-disable-line
    log.push(action)
    return next(action)
  }
  const monitor = {
  }
  const sagaMiddleware = createSagaMiddleware({ sagaMonitor: monitor })

  const store = createStore(combineReducers(reducers),
    state, applyMiddleware(logger, sagaMiddleware))
  return {
    log,
    store,
    sagaMiddleware,
    monitor,
  }
}

export const effectNames =
  Object.keys(utils.asEffect).reduce((effects, name) => ({
    ...effects,
    [name]: name,
  }), {
    isPromise: 'promise',
    isHelper: 'helper',
    isIterator: 'iterator',
    takeEvery: 'takeEvery',
    takeLatest: 'takeLatest',
    throttle: 'throttle',
    takem: 'takem',
    apply: 'apply',
    spawn: 'spawn',
  })

export const effectName = effect =>
  effectNames[Object.keys(tests).map(test => tests[test](effect) && test).filter(t => t)[0]]

export const toEffectAction = effect => ({
  type: effectName(effect),
  effect
})

export const START = { type: '###@@@start' }

export function testSaga(state = undefined) {
  const { sagaMiddleware, store, monitor } = sagaStore(state)
  return (sagas, test) => {
    sagaMiddleware.run(function*() {
      yield effects.take('###@@@start')
      yield sagas.map(args => effects.fork(...args))
    })
    runSaga(test(), {
      subscribe: (callback) => {
        monitor.effectTriggered = ({ effect }) => {
          if (effect.length) {
            effect.forEach((e) => {
              callback(toEffectAction(e))
            })
          } else {
            callback(toEffectAction(effect))
          }
        }
        return () => null
      },
      dispatch: (output) => {
        store.dispatch(output)
      }
    })
  }
}

function renderComponent(ComponentClass, props = {}, state = {}, returnStore = false,
  sagaStore = false) {
  let store
  let log
  const sagaMiddleware = createSagaMiddleware()
  if (!sagaStore) {
    log = []
    const logger = store => next => action => { // eslint-disable-line
      log.push(action)
      return next(action)
    }

    store = createStore(combineReducers({ routing: reducer, week: fakeWeekReducer }),
      state, applyMiddleware(logger, sagaMiddleware))
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
  ).render()
  const ret = componentInstance
  if (returnStore) {
    if (sagaStore) {
      return [ret, sagaStore.store, sagaStore.log, sagaStore.sagaMiddleware]
    }
    return [ret, store, log, sagaMiddleware]
  }
  return ret
}

export { renderComponent, connect, sagaStore } // eslint-disable-line
