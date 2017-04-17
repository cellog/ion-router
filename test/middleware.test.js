import createHistory from 'history/createMemoryHistory'

import createMiddleware, { ignoreKey } from '../src/middleware'
import * as actions from '../src/actions'
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
  })
})
