import reducer from '../src/reducer'
import * as actions from '../src/actions'

describe('react-redux-saga-router reducer', () => {
  it('ROUTE', () => {
    const state = reducer()
    expect(reducer(state, actions.route({
      pathname: '',
      search: '',
      hash: ''
    }))).equals(state)
    expect(reducer(state, actions.route({
      pathname: '/foo',
      search: '',
      hash: ''
    }))).eqls({
      ...state,
      location: {
        pathname: '/foo',
        search: '',
        hash: ''
      }
    })
  })
  it('MATCH_ROUTES', () => {
    const state = reducer()
    expect(reducer(state, actions.matchRoutes(['foo']))).eqls({
      ...state,
      matchedRoutes: ['foo']
    })
  })
  it('SET_PARAMS', () => {
    const state = reducer()
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
    }))).eqls({
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
  it('EDIT_ROUTE', () => {
    const state = reducer()
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
    }))).eqls({
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
  it('BATCH_ROUTE', () => {
    const state = reducer()
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
    expect(reducer(state, action)).eqls(newstate)
  })
  it('REMOVE_ROUTE', () => {
    const start = reducer()
    const state = reducer(start, actions.addRoute({ name: 'hi', path: '/hi/:there' }))
    expect(reducer(state, actions.removeRoute('hi'))).eqls(start)
  })
  it('BATCH_REMOVE_ROUTES', () => {
    const fstate = reducer(undefined, actions.batchRoutes([
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
    ]))
    expect(reducer(fstate, actions.batchRemoveRoutes([
      {
        name: 'fer',
        path: '/fer',
        params: {},
        state: {}
      }
    ]))).eqls({
      ...fstate,
      routes: {
        ids: ['far'],
        routes: {
          far: fstate.routes.routes.far
        }
      }
    })
  })
  it('unknown type', () => {
    const state = reducer()
    expect(reducer(state, { type: '@#%Y@#$*(##$' })).equals(state)
  })
})
