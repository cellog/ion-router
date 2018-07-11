import reducer from '../src/reducer'
import * as actions from '../src/actions'

describe('reducer', () => {
  test('ROUTE', () => {
    const state = { ...reducer() }
    expect(reducer(state, actions.route({
      pathname: '',
      search: '',
      hash: ''
    }))).toBe(state)
    expect(reducer(state, actions.route({
      pathname: '/foo',
      search: '',
      hash: ''
    }))).toEqual({
      ...state,
      location: {
        pathname: '/foo',
        search: '',
        hash: ''
      }
    })
  })
  test('MATCH_ROUTES', () => {
    const state = { ...reducer() }
    expect(reducer(state, actions.matchRoutes(['foo']))).toEqual({
      ...state,
      matchedRoutes: ['foo']
    })
  })
  test('SET_PARAMS', () => {
    const state = { ...reducer() }
    state.routes = {
      ids: ['foo', 'bar'],
      routes: {
        foo: {
          name: 'foo',
          params: {
            foo: undefined
          },
          state: {
            bar: undefined
          }
        },
        bar: {
          name: 'bar',
          params: {
            foo: undefined
          },
          state: {
            bar: undefined
          }
        }
      }
    }
    expect(reducer(state, actions.setParamsAndState('foo', {
      foo: 'bar'
    }, {
      bar: 'bar'
    }))).toEqual({
      ...state,
      routes: {
        ...state.routes,
        routes: {
          ...state.routes.routes,
          foo: {
            name: 'foo',
            params: {
              foo: 'bar'
            },
            state: {
              bar: 'bar'
            }
          }
        }
      }
    })
  })
  test('EDIT_ROUTE', () => {
    const state = { ...reducer() }
    state.routes = {
      ids: ['foo', 'bar'],
      routes: {
        foo: {
          name: 'foo',
          params: {
            foo: undefined
          },
          state: {
            bar: undefined
          }
        },
        bar: {
          name: 'bar',
          params: {
            foo: undefined
          },
          state: {
            bar: undefined
          }
        }
      }
    }
    expect(reducer(state, actions.addRoute({
      name: 'hi',
      path: '/hi/:there',
      stateFromParams: hi => hi
    }))).toEqual({
      ...state,
      routes: {
        ids: ['foo', 'bar', 'hi'],
        routes: {
          ...state.routes.routes,
          hi: {
            name: 'hi',
            path: '/hi/:there',
            parent: undefined,
            params: {},
            state: {}
          }
        }
      }
    })
  })
  test('BATCH_ROUTE', () => {
    const state = { ...reducer() }
    state.routes = {
      ids: ['foo', 'bar'],
      routes: {
        foo: {
          name: 'foo',
          path: '/foo(/:foo)',
          params: {
            foo: undefined
          },
          state: {
            bar: undefined
          }
        },
        bar: {
          name: 'bar',
          path: '/bar(/:foo)',
          params: {
            foo: undefined
          },
          state: {
            bar: undefined
          }
        }
      }
    }
    const action = actions.batchRoutes([
      {
        name: 'fer',
        path: '/fer',
        params: {},
        state: {}
      }, {
        name: 'far',
        path: '/far',
        parent: 'foo',
        params: {},
        state: {}
      }
    ])
    const newstate = {
      ...state,
      routes: {
        ids: [...state.routes.ids, 'fer', 'far'],
        routes: {
          ...state.routes.routes,
          fer: {
            name: 'fer',
            path: '/fer',
            parent: undefined,
            params: {},
            state: {}
          },
          far: {
            name: 'far',
            path: '/far',
            parent: 'foo',
            params: {},
            state: {}
          }
        }
      }
    }
    expect(reducer(state, action)).toEqual(newstate)
  })
  test('REMOVE_ROUTE', () => {
    const start = { ...reducer() }
    const state = reducer(start, actions.addRoute({ name: 'hi', path: '/hi/:there' }))
    expect(reducer(state, actions.removeRoute('hi'))).toEqual(start)
  })
  test('BATCH_REMOVE_ROUTES', () => {
    const fstate = { ...reducer(undefined, actions.batchRoutes([
      {
        name: 'fer',
        path: '/fer',
        params: {},
        state: {}
      }, {
        name: 'far',
        path: '/far',
        parent: 'foo',
        params: {},
        state: {}
      }
    ])) }
    expect(reducer(fstate, actions.batchRemoveRoutes([
      {
        name: 'fer',
        path: '/fer',
        params: {},
        state: {}
      }
    ]))).toEqual({
      ...fstate,
      routes: {
        ids: ['far'],
        routes: {
          far: fstate.routes.routes.far
        }
      }
    })
  })
  test('unknown type', () => {
    const state = reducer()
    expect(reducer(state, { type: '@#%Y@#$*(##$' })).toBe(state)
  })
})
