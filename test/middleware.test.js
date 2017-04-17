import createHistory from 'history/createMemoryHistory'

import createMiddleware, { actionHandlers, ignoreKey } from '../src/middleware'
import { synchronousMakeRoutes, routerReducer } from '../src'
import * as actions from '../src/actions'
import * as types from '../src/types'
import * as enhancers from '../src/enhancers'
import { sagaStore } from './test_helper'

describe('middleware', () => {
  it('subscribes to history', () => {
    const spy = {
      listen: sinon.spy(),
      location: {
        pathname: 'hi',
        search: '',
        hash: ''
      }
    }
    const store = {
      dispatch: sinon.spy()
    }
    const mid = createMiddleware(spy)
    expect(mid(store)).is.instanceof(Function)
    expect(spy.listen).called
    expect(spy.listen.args[0][0]).is.instanceof(Function)
    spy.listen.args[0][0]({
      pathname: 'foo',
      search: '',
      hash: ''
    })
    expect(store.dispatch.called).is.true
    expect(store.dispatch.args[0]).eqls([actions.route({
      pathname: 'foo',
      search: '',
      hash: ''
    })])
    store.dispatch = sinon.spy()
    spy.listen.args[0][0]({
      pathname: 'foo',
      search: '',
      hash: ''
    })
    expect(store.dispatch.called).is.false
  })
  describe('normal functionality tests', () => {
    let history
    let opts
    function makeStuff(spies) {
      const mid = createMiddleware(history, opts, spies)
      return sagaStore(undefined, undefined, [mid])
    }
    beforeEach(() => {
      history = createHistory({
        initialEntries: ['/']
      })
      opts = {
        enhancedRoutes: {}
      }
    })
    it('calls ignore when receiving an action in process', () => {
      const spy = sinon.spy()
      const spies = {
        '*': enhancedRoutes => ({
          newEnhancedRoutes: enhancedRoutes,
          toDispatch: [
            { type: 'foo' }
          ]
        }),
        [ignoreKey]: (store, next, action) => {
          spy(store, next, action)
          next(action)
        }
      }
      const info = makeStuff(spies)
      info.store.dispatch(actions.route('/hi'))
      expect(spy.called).is.true
      expect(info.log).eqls([
        actions.route('/hi'),
        { type: 'foo' }
      ])
    })
    it('calls an action handler', () => {
      const spy = sinon.spy()
      const spies = {
        hithere: (enhancedRoutes, state, action) => {
          spy(enhancedRoutes, state, action)
          return {
            newEnhancedRoutes: enhancedRoutes,
            toDispatch: []
          }
        }
      }
      const info = makeStuff(spies)
      const action = { type: 'hithere' }
      info.store.dispatch(action)
      expect(spy.called).is.true
      expect(spy.args[0][0]).equals(opts.enhancedRoutes)
      expect(spy.args[0][1]).equals(info.store.getState())
      expect(spy.args[0][2]).equals(action)
    })
    it('ignores actions triggered in toDispatch', () => {
      const spy = sinon.spy()
      const spies = {
        ...actionHandlers,
        hithere: (enhancedRoutes, state, action) => {
          spy(enhancedRoutes, state, action)
          return {
            newEnhancedRoutes: enhancedRoutes,
            toDispatch: [{ type: 'hithere' }]
          }
        }
      }
      const info = makeStuff(spies)
      const action = { type: 'hithere' }
      info.store.dispatch(action)
      expect(spy.called).is.true
      expect(spy.args[0][0]).equals(opts.enhancedRoutes)
      expect(spy.args[0][1]).equals(info.store.getState())
      expect(spy.args[0][2]).equals(action)
      expect(spy.args.length).eqls(1)
      expect(info.log).eqls([
        { type: 'hithere' },
        { type: 'hithere' },
      ])
    })
  })
  describe('action handlers', () => {
    it('EDIT_ROUTE', () => {
      const enhanced = {}
      const testenhanced = enhanced
      const state = {}
      const teststate = state
      expect(actionHandlers[types.EDIT_ROUTE](enhanced, state, actions.addRoute({
        name: 'foo',
        path: '/hi'
      }))).eqls({
        newEnhancedRoutes: enhancers.save(actions.addRoute({
          name: 'foo',
          path: '/hi'
        }).payload, enhanced),
        toDispatch: []
      })
      // verify purity of the function
      expect(enhanced).equals(testenhanced)
      expect(state).equals(teststate)
    })
    it('BATCH_ROUTES', () => {
      const enhanced = {}
      const testenhanced = enhanced
      const state = {}
      const teststate = state
      const action = actions.batchRoutes([{
        name: 'foo',
        path: '/hi'
      }, {
        name: 'bar',
        path: '/there'
      }])
      expect(actionHandlers[types.BATCH_ROUTES](enhanced, state, action)).eqls({
        newEnhancedRoutes: enhancers.save(action.payload.routes.bar,
          enhancers.save(action.payload.routes.foo, enhanced)),
        toDispatch: []
      })
      // verify purity of the function
      expect(enhanced).equals(testenhanced)
      expect(state).equals(teststate)
    })
    it('REMOVE_ROUTE', () => {
      const enhanced = {
        foo: {
          name: 'foo',
          path: '/hi'
        }
      }
      const testenhanced = enhanced
      const state = {}
      const teststate = state
      const action = actions.removeRoute('foo')
      expect(actionHandlers[types.REMOVE_ROUTE](enhanced, state, action)).eqls({
        newEnhancedRoutes: {},
        toDispatch: []
      })
      // verify purity of the function
      expect(enhanced).equals(testenhanced)
      expect(state).equals(teststate)
    })
    it('BATCH_REMOVE_ROUTES', () => {
      const enhanced = {
        foo: {
          name: 'foo',
          path: '/hi'
        },
        bar: {
          name: 'bar',
          path: '/there'
        }
      }
      const testenhanced = enhanced
      const state = {}
      const teststate = state
      const action = actions.batchRemoveRoutes([enhanced.foo, enhanced.bar])
      expect(actionHandlers[types.BATCH_REMOVE_ROUTES](enhanced, state, action)).eqls({
        newEnhancedRoutes: {},
        toDispatch: []
      })
      // verify purity of the function
      expect(enhanced).equals(testenhanced)
      expect(state).equals(teststate)
    })
  })
  describe('routing handlers', () => {
    let enhanced
    let testenhanced
    let state
    let teststate
    beforeEach(() => {
      const opts = {
        enhancedRoutes: {}
      }
      const action = synchronousMakeRoutes([
        {
          name: 'foo',
          path: '/foo(/:param)',
          paramsToState: params => params,
          stateFromParams: params => params,
          updateState: {
            param: param => ({ type: 'setParam', payload: param })
          }
        },
        {
          name: 'bar',
          path: '/bar(/:hi)',
          paramsToState: params => params,
          stateFromParams: params => params,
          updateState: {
            hi: hi => ({ type: 'setHi', payload: hi })
          }
        },
      ], opts)
      enhanced = opts.enhancedRoutes
      enhanced.bar.params = { hi: 'wow' }
      enhanced.bar.state = { hi: 'wow' }
      testenhanced = enhanced
      const info = routerReducer(undefined, action)
      state = {
        routing: {
          ...info,
          location: {
            pathname: '/bar/wow',
            search: '',
            hash: ''
          },
          matchedRoutes: ['bar'],
          routes: {
            ...info.routes,
            routes: {
              ...info.routes.routes,
              bar: {
                ...info.routes.routes.bar,
                params: {
                  hi: 'wow'
                },
                state: {
                  hi: 'wow'
                }
              }
            }
          }
        },
        boo: {
          param: undefined
        },
        bar: {
          hi: 'wow'
        }
      }
      teststate = state
    })
    it('ROUTE', () => {
      const action = actions.route({
        pathname: '/foo/hi',
        search: '',
        hash: ''
      })
      expect(actionHandlers[types.ROUTE](enhanced, state, action)).eqls({
        newEnhancedRoutes: {
          ...enhanced,
          bar: {
            ...enhanced.bar,
            params: { hi: undefined },
            state: { hi: undefined }
          },
          foo: {
            ...enhanced.foo,
            params: { param: 'hi' },
            state: { param: 'hi' }
          }
        },
        toDispatch: [
          actions.matchRoutes(['foo']),
          actions.exitRoutes(['bar']),
          actions.enterRoutes(['foo']),
          actions.setParamsAndState('foo', { param: 'hi' }, { param: 'hi' }),
          { type: 'setParam', payload: 'hi' },
          actions.setParamsAndState('bar', { hi: undefined }, { hi: undefined }),
          { type: 'setHi', payload: undefined },
        ]
      })
      // verify purity of the function
      expect(enhanced).equals(testenhanced)
      expect(state).equals(teststate)
    })
  })
})
