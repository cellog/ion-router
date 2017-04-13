import * as effects from 'redux-saga/effects'
import createHistory from 'history/createMemoryHistory'

import * as helpers from '../test_helper'
import * as sagas from '../../src/sagas'
import * as enhancers from '../../src/enhancers'
import * as selectors from '../../src/selectors'
import * as actions from '../../src/actions'
import * as types from '../../src/types'
import historyChannel from '../../src/historyChannel'
import * as index from '../../src'

describe('react-redux-saga-router integration tests: url changes', () => {
  const history = createHistory({
    initialEntries: [
      '/groups/2017/1',
      '/campers'
    ],
    initialIndex: 1
  })
  const channel = historyChannel(history)
  const options = {
    server: false,
    enhancedRoutes: {
      campers: enhancers.enhanceRoute({
        name: 'campers',
        path: '/campers(/filter/:search)(/camper/:id)',
        paramsFromState: state => ({
          id: state.campers.id,
          search: state.campers.filter ? state.campers.filter : undefined
        }),
        stateFromParams: params => ({
          id: params.id,
          search: params.search ? params.search : false
        }),
        updateState: {
          id: id => ({ type: 'camperid', payload: id }),
          search: filter => ({ type: 'camperfilter', payload: filter }),
        }
      }),
      groups: enhancers.enhanceRoute({
        name: 'groups',
        path: '/groups(/:year/:week)(/:num)',
        paramsFromState: state => ({
          year: state.groups.year,
          week: state.groups.week,
          num: state.groups.selectedGroup ? state.groups.selectedGroup : undefined
        }),
        stateFromParams: params => ({
          year: params.year,
          week: params.week,
          num: params.num ? params.num : false
        }),
        updateState: {
          year: year => ({ type: 'groupyear', payload: year }),
          week: week => ({ type: 'groupweek', payload: week }),
          num: num => ({ type: 'groupnum', payload: num })
        }
      })
    },
    pending: false,
    resolve: false,
  }
  const state = {
    campers: {
      id: undefined,
      filter: false
    },
    groups: {
      year: '1',
      week: '2',
      num: '3'
    },
    routing: {
      location: {
        pathname: '/campers',
        search: '',
        hash: ''
      },
      matchedRoutes: ['campers'],
      routes: {
        ids: ['campers', 'groups'],
        routes: {
          campers: {
            name: 'campers',
            path: '/campers(/filter/:search)(/camper/:id)',
            parent: undefined,
            params: {},
            state: {}
          },
          groups: {
            name: 'groups',
            path: '/groups(/:year/:week)(/:num)',
            parent: undefined,
            params: {},
            state: {}
          }
        },
      }
    }
  }
  const reducers = {
    campers: (state = {
      id: undefined,
      filter: false
    }, action) => {
      switch (action.type) {
        case 'camperid':
          return {
            ...state,
            id: action.payload
          }
        case 'camperfilter':
          return {
            ...state,
            filter: action.payload
          }
        default :
          return state
      }
    },
    groups: (state = {
      year: '1',
      week: '2',
      num: '3'
    }, action) => {
      switch (action.type) {
        case 'groupyear':
          return {
            ...state,
            groups: {
              ...state.groups,
              year: action.payload
            }
          }
        case 'groupweek':
          return {
            ...state,
            groups: {
              ...state.groups,
              week: action.payload
            }
          }
        case 'groupnum':
          return {
            ...state,
            groups: {
              ...state.groups,
              num: action.payload
            }
          }
        default:
          return state
      }
    }
  }
  const run = helpers.testSaga(state, reducers)

  it('proof of concept', (done) => {
    run([
      [sagas.routeMonitor, options, history],
      [sagas.stateMonitor, options],
      [sagas.browserListener, history],
      [sagas.locationListener, channel, options],
    ], function *test() {
      yield effects.put.resolve(helpers.START)
      yield effects.take()
      const stuff = (yield effects.select()).length
      for (let i = 1; i < stuff; i++) {
        yield effects.take()
      }
      yield effects.put({ type: 'camperfilter', payload: 'hi' })

      let ef = yield effects.take()
      expect(ef.effect).eqls(effects.select())

      ef = yield effects.take()
      expect(ef.effect).eqls(effects.call(index.nonBlockingPending, options))

      const newState = {
        ...state,
        campers: {
          ...state.campers,
          filter: 'hi'
        }
      }

      ef = yield effects.take()
      expect(ef.effect).eqls(effects.call(index.begin, options))

      ef = yield effects.take()
      expect(ef.effect).eqls(effects.call(sagas.handleStateChange, newState,
        options.enhancedRoutes))

      ef = yield effects.take()
      expect(ef.effect).eqls(effects.call(selectors.matchedRoute, newState, 'campers'))

      ef = yield effects.take()
      expect(ef.effect).eqls(effects.call(sagas.getUrlUpdate, newState,
        options.enhancedRoutes.campers))

      ef = yield effects.take()
      expect(ef.effect).eqls(effects.call([options.enhancedRoutes.campers['@parser'],
        options.enhancedRoutes.campers['@parser'].match], '/campers/filter/hi'))

      ef = yield effects.take()
      expect(ef.effect).eqls(effects.call(options.enhancedRoutes.campers.stateFromParams,
        { search: 'hi', id: undefined }, newState))

      ef = yield effects.take()
      expect(ef.effect).eqls(effects.put(actions.setParamsAndState('campers',
        { search: 'hi', id: undefined }, { id: undefined, search: 'hi' })))

      ef = yield effects.take()
      expect(ef.effect).eqls(effects.fork(sagas.saveParams, options, actions.setParamsAndState('campers',
        { search: 'hi', id: undefined }, { id: undefined, search: 'hi' })))

      ef = yield effects.take()
      expect(ef.effect).eqls(effects.call(index.setEnhancedRoutes, {
        ...options.enhancedRoutes,
        campers: {
          ...options.enhancedRoutes.campers,
          params: {
            search: 'hi', id: undefined
          },
          state: {
            search: 'hi', id: undefined
          },
        }
      }))

      ef = yield effects.take()
      expect(ef.effect).eqls(effects.take(types.SET_PARAMS))

      ef = yield effects.take()
      expect(ef.effect).eqls(effects.put(actions.push('/campers/filter/hi')))

      ef = yield effects.take()
      expect(ef.effect).eqls(effects.fork([history, history.push], '/campers/filter/hi', {}))

      ef = yield effects.take()
      expect(ef.effect).eqls(effects.call(index.nonBlockingPending, options))

      ef = yield effects.take()
      expect(ef.effect).eqls(effects.take(channel))

      ef = yield effects.take('endSaga')

      ef = yield effects.take()
      expect(ef.effect).eqls(effects.take(types.ACTION))

      ef = yield effects.take()
      expect(ef.effect).eqls(effects.call(selectors.matchedRoute, newState, 'groups'))

      ef = yield effects.take()
      expect(ef.effect).eqls(effects.call(index.commit, options))

      ef = yield effects.take()
      expect(ef.effect).eqls(effects.take('*'))

      yield effects.call(done)
    })
  })
})
