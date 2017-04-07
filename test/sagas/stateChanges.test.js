import { call, put } from 'redux-saga/effects'
import RouteParser from 'route-parser'

import * as actions from '../../src/actions'
import * as selectors from '../../src/selectors'
import * as enhancers from '../../src/enhancers'
import * as stateChanges from '../../src/sagas/stateChanges'

describe('react-redux-saga-router state changes sagas', () => {
  let state
  let enhanced
  beforeEach(() => {
    state = {
      routing: {
        routes: {
          ids: ['hi', 'there'],
          routes: {
            hi: {
              name: 'hi',
              path: '/hi(/:there)',
              parent: undefined,
              params: {
                there: undefined
              },
              state: {
                there: undefined
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
    enhanced = enhancers.save(state.routing.routes.routes.there,
      enhancers.save(state.routing.routes.routes.hi, {}))
  })
  describe('handleStateChange', () => {
    it('no matches', () => {
      const saga = stateChanges.handleStateChange(state, enhanced)
      let next = saga.next()

      expect(next.value).eqls(call(selectors.matchedRoute, state, 'hi'))
      next = saga.next(false)

      expect(next.value).eqls(call(selectors.matchedRoute, state, 'there'))
      next = saga.next(false)

      expect(next).eqls({ value: undefined, done: true })
    })
    it('matches 2nd', () => {
      const saga = stateChanges.handleStateChange(state, enhanced)
      let next = saga.next()

      expect(next.value).eqls(call(selectors.matchedRoute, state, 'hi'))
      next = saga.next(false)

      expect(next.value).eqls(call(selectors.matchedRoute, state, 'there'))
      next = saga.next(true)

      expect(next.value).eqls(call(stateChanges.getUrlUpdate, state, enhanced.there))
      next = saga.next('/there/boo')

      expect(next.value).eqls(call([enhanced.there['@parser'], enhanced.there['@parser'].match], '/there/boo'))
      const params = enhanced.there['@parser'].match('/there/boo')
      next = saga.next(params)

      expect(next.value).eqls(call([enhanced.there, enhanced.there.stateFromParams], params, state))
      next = saga.next(params)

      expect(next.value).eqls(put(actions.setParamsAndState('there', params, params)))
      next = saga.next()

      expect(next.value).eqls(put(actions.push('/there/boo')))
    })
  })
  it('getUrlUpdate', () => {
    expect(stateChanges.getUrlUpdate(state, {
      name: 'hi',
      paramsFromState: () => ({ there: 'fronk' }),
      '@parser': new RouteParser('/hi(/:there)'),
    })).eqls('/hi/fronk')
    expect(stateChanges.getUrlUpdate(state, {
      name: 'hi',
      paramsFromState: () => ({ there: undefined }),
      '@parser': new RouteParser('/hi(/:there)'),
    })).eqls(false)
  })
  it('changed', () => {
    expect(stateChanges.changed({
      hi: 'there'
    }, {
      hi: 'there'
    })).eqls([])
    expect(stateChanges.changed({
      hi: 'f',
      boo: 'boo'
    }, {
      hi: 'there',
    })).eqls(['hi', 'boo'])
    expect(stateChanges.changed({
      hi: 'f',
    }, {
      hi: 'there',
      boo: 'boo'
    })).eqls(['hi', 'boo'])
  })
})
