import { takeEvery, take, fork, put, select, call } from 'redux-saga/effects'
import createHistory from 'history/createMemoryHistory'

import * as types from '../../src/types'
import * as actions from '../../src/actions'
import * as events from '../../src/sagas/events'
import historyChannel from '../../src/historyChannel'
import * as routing from '../../src/sagas/matchRoutes'
import * as create from '../../src/sagas/createRoutes'
import * as stateChanges from '../../src/sagas/stateChanges'
import * as index from '../../src'

describe('react-redux-saga-router event sagas', () => {
  it('browserActions', () => {
    const fake = { push: () => null }
    const saga = events.browserListener(fake)
    let next = saga.next()

    expect(next.value).eqls(take(types.ACTION))
    next = saga.next(actions.push('/hi'))

    expect(next.value).eqls(fork([fake, fake.push], '/hi', {}))
    next = saga.next()

    expect(next.value).eqls(take(types.ACTION))
    next = saga.next(actions.push('/hi', { some: 'state' }))

    expect(next.value).eqls(fork([fake, fake.push], '/hi', { some: 'state' }))
    next = saga.next()

    expect(next.value).eqls(take(types.ACTION))
  })
  it('locationListener', () => {
    const history = createHistory({
      initialEntries: ['/ensembles']
    })
    const channel = historyChannel(history)
    const options = {
      enhancedRoutes: {}
    }

    const saga = events.locationListener(channel, options)
    let next = saga.next()

    expect(next.value).eqls(take(channel))
    next = saga.next({
      location: {
        pathname: '/campers/2017',
        search: '',
        hash: ''
      }
    })

    expect(next.value).eqls(call(index.nonBlockingPending, options))
    next = saga.next(false)

    expect(next.value).eqls(call(index.begin, options))
    next = saga.next()

    expect(next.value).eqls(select())
    next = saga.next('hi')

    expect(next.value).eqls(call(routing.matchRoutes, 'hi', '/campers/2017', options.enhancedRoutes))
    next = saga.next()

    expect(next.value).eqls(put(actions.route({
      pathname: '/campers/2017',
      search: '',
      hash: ''
    })))
    next = saga.next()

    expect(next.value).eqls(call(index.commit, options))
    next = saga.next()

    expect(next.value).eqls(take(channel))
    next = saga.next({
      location: {
        pathname: '/campers/2017',
        search: '',
        hash: ''
      }
    })
  })
  describe('stateMonitor', () => {
    it('normal flow, state change', () => {
      const options = { enhancedRoutes: {} }
      const saga = events.stateMonitor(options)
      let next = saga.next()

      expect(next.value).eqls(select())
      next = saga.next({
        routing: 'hi'
      })

      expect(next.value).eqls(take('*'))
      next = saga.next(actions.route('hi'))

      expect(next.value).eqls(select())
      next = saga.next('there')

      expect(next.value).eqls(call(index.nonBlockingPending, options))
      next = saga.next()

      expect(next.value).eqls(call(index.begin, options))
      next = saga.next()

      expect(next.value).eqls(call(stateChanges.handleStateChange, 'there', options.enhancedRoutes))
      next = saga.next()

      expect(next.value).eqls(call(index.commit, options))
      next = saga.next()

      expect(next.value).eqls(take('*'))
    })
    it('normal flow, no state change', () => {
      const options = { enhancedRoutes: {} }
      const saga = events.stateMonitor(options)
      let next = saga.next()
      const fakeState = {
        routing: 'hi'
      }

      expect(next.value).eqls(select())
      next = saga.next(fakeState)

      expect(next.value).eqls(take('*'))
      next = saga.next(actions.route('hi'))

      expect(next.value).eqls(select())
      next = saga.next(fakeState)

      expect(next.value).eqls(call(index.nonBlockingPending, options))
      next = saga.next()

      expect(next.value).eqls(take('*'))
    })
    it('routeMonitor', () => {
      const saga = events.routeMonitor('hi', 'there')
      expect(saga.next().value).eqls(takeEvery([types.EDIT_ROUTE, types.BATCH_ROUTES], create.enhanceSaga, 'hi', 'there'))
      expect(saga.next().value).eqls(takeEvery(types.SET_PARAMS, create.saveParams, 'hi'))
    })
  })
})
