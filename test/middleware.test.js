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
  it('calls ignore when receiving an action in process', () => {
    const history = createHistory({
      initialEntries: ['/']
    })
    const opts = {
      enhancedRoutes: {}
    }
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
    const mid = createMiddleware(history, opts, spies)
    const info = sagaStore(undefined, undefined, [mid])
    info.store.dispatch(actions.route('/hi'))
    expect(spy.called).is.true
    expect(info.log).eqls([
      actions.route('/hi'),
      { type: 'foo' }
    ])
  })
})
