import reducer from '../src/reducer'
import * as actions from '../src/actions'
import * as types from '../src/types'

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
    expect(reducer(state, actions.addRoute('hi', '/hi/:there'))).eqls({
      ...state,
      routes: {
        ids: ['foo', 'bar', 'hi'],
        routes: {
          ...state.routes.routes,
          hi: {
            name: 'hi',
            url: '/hi/:there',
            params: {},
            state: {}
          }
        }
      }
    })
  })
  it('REMOVE_ROUTE', () => {
    const start = reducer()
    const state = reducer(start, actions.addRoute('hi', '/hi/:there'))
    expect(reducer(state, actions.removeRoute('hi'))).eqls(start)
  })
  it('unknown type', () => {
    const state = reducer()
    expect(reducer(state, { type: '@#%Y@#$*(##$' })).equals(state)
  })
})