import * as actions from '../src/actions'
import * as types from '../src/types'

describe('react-redux-saga-router actions', () => {
  it('push', () => {
    expect(actions.push('/hi')).eqls({
      type: types.ACTION,
      payload: {
        verb: 'push',
        route: '/hi'
      }
    })
  })
  it('replace', () => {
    expect(actions.replace('/hi')).eqls({
      type: types.ACTION,
      payload: {
        verb: 'replace',
        route: '/hi'
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
})
