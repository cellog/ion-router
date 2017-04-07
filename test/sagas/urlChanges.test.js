import { call, put, fork } from 'redux-saga/effects'

import * as actions from '../../src/actions'
import * as urlChanges from '../../src/sagas/urlChanges'
import * as enhancers from '../../src/enhancers'

describe('react-redux-saga-router url change sagas', () => {
  const state = {
    routing: {
      routes: {
        ids: ['hi', 'there'],
        routes: {
          hi: {
            name: 'hi',
            path: '/hi(/:there(/:buddy))',
            parent: undefined,
            params: {
              there: undefined,
              buddy: undefined
            },
            state: {
              there: undefined,
              buddy: undefined
            },
          },
          there: {
            name: 'there',
            path: '/there(/:hi)',
            parent: undefined,
            params: {
              hi: undefined
            },
            state: {
              hi: undefined
            },
          },
        }
      }
    }
  }
  const enhanced = enhancers.save(
    state.routing.routes.routes.there,
    enhancers.save({
      ...state.routing.routes.routes.hi,
      stateFromParams: params => params,
      paramsFromState: state => state,
      updateState: {
        there: t => ({ type: 'foo', payload: t })
      }
    }, {})
  )
  it('stateFromLocation', () => {
    const saga = urlChanges.stateFromLocation(enhanced, state, '/hi/boo/boor')
    let next = saga.next()

    expect(next.value).eqls(fork(urlChanges.updateState, enhanced.hi,
      {
        there: 'boo',
        buddy: 'boor'
      }, state))
    next = saga.next()
    expect(next).eqls({ value: undefined, done: true })
  })
  it('updateState', () => {
    const saga = urlChanges.updateState(enhanced.hi, {
      there: 'boo',
      buddy: 'boor'
    }, state)
    let next = saga.next()

    expect(next.value).eqls(call(urlChanges.getStateUpdates, enhanced.hi,
      {
        there: 'boo',
        buddy: 'boor'
      }))
    next = saga.next([
      { type: 'foo', payload: 'boo' }
    ])

    expect(next.value).eqls(put(actions.setParamsAndState('hi', {
      there: 'boo',
      buddy: 'boor'
    }, {
      there: 'boo',
      buddy: 'boor'
    })))
    next = saga.next()

    expect(next.value).eqls([put({ type: 'foo', payload: 'boo' })])
    next = saga.next()

    expect(next).eqls({ value: undefined, done: true })
  })
  it('getStateUpdates', () => {
    expect(urlChanges.getStateUpdates(enhanced.hi, {
      there: 'boo',
      buddy: 'boor',
    }, 'hi')).eqls([
      { type: 'foo', payload: 'boo' }
    ])
  })
})
