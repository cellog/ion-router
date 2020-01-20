import * as actions from '../src/actions'
import * as types from '../src/types'


describe('actions', () => {
  test('push', () => {
    expect(actions.push('/hi')).toEqual({
      type: types.ACTION,
      payload: {
        verb: 'push',
        route: '/hi',
        state: {}
      }
    })
    expect(actions.push('/hi', { some: 'state' })).toEqual({
      type: types.ACTION,
      payload: {
        verb: 'push',
        route: '/hi',
        state: { some: 'state' }
      }
    })
  })
  test('replace', () => {
    expect(actions.replace('/hi')).toEqual({
      type: types.ACTION,
      payload: {
        verb: 'replace',
        route: '/hi',
        state: {}
      }
    })
    expect(actions.replace('/hi', { some: 'state' })).toEqual({
      type: types.ACTION,
      payload: {
        verb: 'replace',
        route: '/hi',
        state: { some: 'state' }
      }
    })
  })
  test('go', () => {
    expect(actions.go(5)).toEqual({
      type: types.ACTION,
      payload: {
        verb: 'go',
        distance: 5
      }
    })
  })
  test('goBack', () => {
    expect(actions.goBack()).toEqual({
      type: types.ACTION,
      payload: {
        verb: 'goBack',
      }
    })
  })
  test('goForward', () => {
    expect(actions.goForward()).toEqual({
      type: types.ACTION,
      payload: {
        verb: 'goForward',
      }
    })
  })
  test('route', () => {
    expect(actions.route({
      pathname: '/hi',
      search: '',
      hash: ''
    })).toEqual({
      type: types.ROUTE,
      payload: {
        pathname: '/hi',
        search: '',
        hash: ''
      }
    })
  })
  test('matchRoutes', () => {
    expect(actions.matchRoutes(['route1', 'route2'])).toEqual({
      type: types.MATCH_ROUTES,
      payload: ['route1', 'route2']
    })
  })
  test('addRoute', () => {
    expect(actions.addRoute({ name: 'foo', path: '/hi/:there' })).toEqual({
      type: types.EDIT_ROUTE,
      payload: {
        name: 'foo',
        path: '/hi/:there',
        parent: undefined,
        params: {},
        state: {}
      }
    })
  })
  test('batchRoutes', () => {
    expect(actions.batchRoutes([{
      name: 'foo',
      path: '/hi/there',
    }, {
      name: 'bar',
      path: '/bar/ber',
      parent: 'foo'
    }])).toEqual({
      type: types.BATCH_ROUTES,
      payload: {
        ids: ['foo', 'bar'],
        routes: {
          foo: {
            name: 'foo',
            path: '/hi/there',
            parent: undefined,
            params: {},
            state: {}
          },
          bar: {
            name: 'bar',
            path: '/bar/ber',
            parent: 'foo',
            params: {},
            state: {}
          }
        }
      }
    })
  })

  test('batchRemoveRoutes', () => {
    expect(actions.batchRemoveRoutes([{
      name: 'foo',
      path: '/hi/there',
    }, {
      name: 'bar',
      path: '/bar/ber',
      parent: 'foo'
    }])).toEqual({
      type: types.BATCH_REMOVE_ROUTES,
      payload: {
        ids: ['foo', 'bar'],
        routes: {
          foo: {
            name: 'foo',
            path: '/hi/there',
            parent: undefined,
            params: {},
            state: {}
          },
          bar: {
            name: 'bar',
            path: '/bar/ber',
            parent: 'foo',
            params: {},
            state: {}
          }
        }
      }
    })
  })
  test('removeRoute', () => {
    expect(actions.removeRoute('foo')).toEqual({
      type: types.REMOVE_ROUTE,
      payload: 'foo'
    })
  })
  test('setParamsAndState', () => {
    expect(actions.setParamsAndState('route', {
      foo: 'bar'
    }, {
      bar: 'bar'
    })).toEqual({
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
  test('enterRoutes', () => {
    expect(actions.enterRoutes(['hi'])).toEqual({
      type: types.ENTER_ROUTES,
      payload: ['hi']
    })
  })
  test('exitRoutes', () => {
    expect(actions.exitRoutes(['hi'])).toEqual({
      type: types.EXIT_ROUTES,
      payload: ['hi']
    })
  })
  test('pending', () => {
    expect(actions.pending()).toEqual({
      type: types.PENDING_UPDATES,
      payload: null
    })
  })
  test('committed', () => {
    expect(actions.commit()).toEqual({
      type: types.COMMITTED_UPDATES,
      payload: null
    })
  })
})
