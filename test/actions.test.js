import * as actions from '../src/actions'
import * as types from '../src/types'

describe('react-redux-saga-router actions', () => {
  it('push', () => {
    expect(actions.push('/hi')).eqls({
      type: types.ACTION,
      payload: {
        verb: 'push',
        route: '/hi',
        state: undefined
      }
    })
    expect(actions.push('/hi', { some: 'state' })).eqls({
      type: types.ACTION,
      payload: {
        verb: 'push',
        route: '/hi',
        state: { some: 'state' }
      }
    })
  })
  it('replace', () => {
    expect(actions.replace('/hi')).eqls({
      type: types.ACTION,
      payload: {
        verb: 'replace',
        route: '/hi',
        state: undefined
      }
    })
    expect(actions.replace('/hi', { some: 'state' })).eqls({
      type: types.ACTION,
      payload: {
        verb: 'replace',
        route: '/hi',
        state: { some: 'state' }
      }
    })
  })
  it('go', () => {
    expect(actions.go('/hi')).eqls({
      type: types.ACTION,
      payload: {
        verb: 'go',
        route: '/hi'
      }
    })
  })
  it('goBack', () => {
    expect(actions.goBack()).eqls({
      type: types.ACTION,
      payload: {
        verb: 'goBack',
      }
    })
  })
  it('goForward', () => {
    expect(actions.goForward()).eqls({
      type: types.ACTION,
      payload: {
        verb: 'goForward',
      }
    })
  })
  it('route', () => {
    expect(actions.route({
      pathname: '/hi',
      search: '',
      hash: ''
    })).eqls({
      type: types.ROUTE,
      payload: {
        pathname: '/hi',
        search: '',
        hash: ''
      }
    })
  })
  it('matchRoutes', () => {
    expect(actions.matchRoutes(['route1', 'route2'])).eqls({
      type: types.MATCH_ROUTES,
      payload: ['route1', 'route2']
    })
  })
  it('addRoute', () => {
    expect(actions.addRoute('foo', '/hi/:there')).eqls({
      type: types.EDIT_ROUTE,
      payload: {
        name: 'foo',
        url: '/hi/:there',
        params: {},
        state: {}
      }
    })
  })
  it('removeRoute', () => {
    expect(actions.removeRoute('foo')).eqls({
      type: types.REMOVE_ROUTE,
      payload: 'foo'
    })
  })
  it('setParamsAndState', () => {
    expect(actions.setParamsAndState('route', {
      foo: 'bar'
    }, {
      bar: 'bar'
    })).eqls({
      type: types.SET_PARAMS,
      payload: {
        route: 'route',
        params: {
          foo: 'bar'
        },
        state: {
          bar: 'bar'
        }
      }
    })
  })
  it('enterRoutes', () => {
    expect(actions.enterRoutes(['hi'])).eqls({
      type: types.ENTER_ROUTES,
      payload: ['hi']
    })
  })
  it('exitRoutes', () => {
    expect(actions.exitRoutes(['hi'])).eqls({
      type: types.EXIT_ROUTES,
      payload: ['hi']
    })
  })
  it('pending', () => {
    expect(actions.pending()).eqls({
      type: types.PENDING_UPDATES,
      payload: null
    })
  })
  it('committed', () => {
    expect(actions.commit()).eqls({
      type: types.COMMITTED_UPDATES,
      payload: null
    })
  })
})
