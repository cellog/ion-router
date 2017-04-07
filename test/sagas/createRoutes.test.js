import { call, select } from 'redux-saga/effects'
import createHistory from 'history/createMemoryHistory'

import * as enhancers from '../../src/enhancers'
import * as actions from '../../src/actions'
import { setEnhancedRoutes, pending, begin, commit } from '../../src'

import * as routing from '../../src/sagas/matchRoutes'
import * as create from '../../src/sagas/createRoutes'

describe('react-redux-saga-router createRoutes sagas', () => {
  const history = createHistory({
    initialEntries: ['/ensembles']
  })
  it('enhanceSaga EDIT_ROUTE', () => {
    const options = {
      enhancedRoutes: {}
    }
    const saga = create.enhanceSaga(options, history, actions.addRoute({
      name: 'foo',
      path: '/foo(/:bar)',
    }))
    let next = saga.next()

    expect(next.value).eqls(call(setEnhancedRoutes, {
      foo: {
        ...enhancers.enhanceRoute({
          name: 'foo',
          path: '/foo(/:bar)',
        }),
        parent: undefined,
        params: {},
        state: {}
      }
    }))

    options.enhancedRoutes = {
      foo: {
        ...enhancers.enhanceRoute({
          name: 'foo',
          path: '/foo(/:bar)',
        }),
        parent: undefined,
        params: {},
        state: {}
      }
    }

    next = saga.next()
    expect(next.value).eqls(call(pending, options))

    next = saga.next()
    expect(next.value).eqls(call(begin, options))

    next = saga.next()
    expect(next.value).eqls(select())

    next = saga.next('hi')
    expect(next.value).eqls(call(routing.matchRoutes, 'hi', '/ensembles', options.enhancedRoutes))

    next = saga.next()
    expect(next.value).eqls(call(commit, options))

    next = saga.next()
    expect(next).eqls({ value: undefined, done: true })
  })
  it('enhanceSaga BATCH_ROUTES', () => {
    const options = {
      enhancedRoutes: {}
    }
    const saga = create.enhanceSaga(options, history, actions.batchRoutes([{
      name: 'foo',
      path: '/foo(/:bar)',
    }]))
    let next = saga.next()

    expect(next.value).eqls(call(setEnhancedRoutes, {
      foo: {
        ...enhancers.enhanceRoute({
          name: 'foo',
          path: '/foo(/:bar)',
        }),
        parent: undefined,
        params: {},
        state: {}
      }
    }))

    options.enhancedRoutes = {
      foo: {
        ...enhancers.enhanceRoute({
          name: 'foo',
          path: '/foo(/:bar)',
        }),
        parent: undefined,
        params: {},
        state: {}
      }
    }

    next = saga.next()
    expect(next.value).eqls(call(pending, options))

    next = saga.next()
    expect(next.value).eqls(call(begin, options))

    next = saga.next()
    expect(next.value).eqls(select())

    next = saga.next('hi')
    expect(next.value).eqls(call(routing.matchRoutes, 'hi', '/ensembles', options.enhancedRoutes))

    next = saga.next()
    expect(next.value).eqls(call(commit, options))

    next = saga.next()
    expect(next).eqls({ value: undefined, done: true })
  })
  it('saveParams', () => {
    const saga = create.saveParams({ enhancedRoutes: {
      foo: {
        name: 'foo',
        params: {},
        state: {}
      }
    } }, actions.setParamsAndState('foo', { hi: 'there' }, { there: 'hi' }))

    expect(saga.next().value).eqls(call(setEnhancedRoutes, {
      foo: {
        name: 'foo',
        params: {
          hi: 'there'
        },
        state: {
          there: 'hi'
        }
      }
    }))
  })
})
