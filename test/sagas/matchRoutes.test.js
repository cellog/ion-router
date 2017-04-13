import { call, put, select } from 'redux-saga/effects'

import * as actions from '../../src/actions'
import * as urlChanges from '../../src/sagas/urlChanges'
import * as routes from '../../src/sagas/matchRoutes'
import * as enhancers from '../../src/enhancers'

describe('react-redux-saga-router route matching sagas', () => {
  let state
  let enhanced
  beforeEach(() => {
    state = {
      routing: {
        matchedRoutes: [],
        location: {
          pathname: '/hi',
          search: undefined,
          hash: undefined
        },
        routes: {
          ids: ['hi', 'there'],
          routes: {
            hi: {
              name: 'hi',
              path: '/hi(/:there(/:buddy))',
              parent: undefined,
              params: {
                there: undefined,
                buddy: undefined
              },
              state: {
                there: undefined,
                buddy: undefined
              },
            },
            there: {
              name: 'there',
              parent: 'hi',
              path: '/hi(/:there(/:buddy))/fizz/:wow',
              params: {
                wow: 'whee',
                there: 'bee',
                buddy: 'boo'
              },
              state: {
                wow: 'whee',
                there: 'bee',
                buddy: 'boo'
              },
            },
          }
        }
      }
    }
    enhanced = enhancers.save(
      {
        ...state.routing.routes.routes.there,
        exitParams: {
          wow: undefined
        },
      },
      enhancers.save({
        ...state.routing.routes.routes.hi,
        updateState: {
          there: t => ({ type: 'foo', payload: t })
        }
      }, {}))
  })

  it('template', () => {
    expect(routes.template({
      exitParams: {}
    })).eqls({})
    expect(routes.template({
      exitParams: p => ({ ...p, hi: 'there' })
    }, { foo: 'bar' })).eqls({
      foo: 'bar',
      hi: 'there'
    })
  })
  it('diff', () => {
    expect(routes.diff([], [])).eqls([])
    expect(routes.diff(['hi'], ['hi'])).eqls([])
    expect(routes.diff(['hi'], [])).eqls(['hi'])
    expect(routes.diff([], ['hi'])).eqls([])
  })
  it('exitRoutes', () => {
    const er = routes.exitRoute({ hi: 'there' })
    expect(routes.exitRoutes(er)('foo')('bar')).eqls(
      call(er, 'bar', 'foo')
    )
  })
  it('exitRoute', () => {
    const saga = routes.exitRoute(state, enhanced)(enhanced.there)
    let next = saga.next()

    expect(next.value).eqls(call(routes.template, enhanced.hi, {
      wow: 'whee',
      there: 'bee',
      buddy: 'boo'
    }))
    next = saga.next(routes.template(enhanced.hi, {
      wow: 'whee',
      there: 'bee',
      buddy: 'boo'
    }))

    expect(next.value).eqls(call(urlChanges.updateState, enhanced.there, {
      wow: undefined,
      there: undefined,
      buddy: undefined
    }, state))
  })
  it('matchRoutes', () => {
    const mystate = {
      ...state,
      routing: {
        ...state.routing,
        matchedRoutes: ['hi']
      }
    }
    const saga = routes.matchRoutes(mystate, '/hi/there', enhanced)
    let next = saga.next()

    expect(next.value).eqls(put(actions.matchRoutes(['hi'])))
    next = saga.next()

    expect(next.value).eqls(select())
    next = saga.next('hi')

    expect(next.value).eqls(call(urlChanges.stateFromLocation, enhanced, 'hi', '/hi/there'))
    next = saga.next()

    expect(next).eqls({
      done: true,
      value: undefined
    })
  })
  it('matchRoutes, exiting and entering', () => {
    const mystate = {
      ...state,
      routing: {
        ...state.routing,
        matchedRoutes: ['there'],
        location: {
          pathname: '/hi/there/fizz/bang'
        }
      }
    }
    const saga = routes.matchRoutes(mystate, '/hi/there', enhanced)
    let next = saga.next()

    expect(next.value).eqls(put(actions.matchRoutes(['hi'])))
    next = saga.next()

    expect(next.value).eqls(put(actions.exitRoutes(['there'])))
    next = saga.next()

    expect(next.value).eqls(put(actions.enterRoutes(['hi'])))
    next = saga.next()

    expect(next.value).eqls(call(routes.exitRoute, mystate, enhanced))
    const er = routes.exitRoute(mystate)
    next = saga.next(er)

    expect(next.value).eqls(call(routes.mapRoute, er, enhanced))
    const mapped = routes.mapRoute(er, enhanced)
    next = saga.next(mapped)

    expect(next.value).eqls([call(mapped, 'there')])
    next = saga.next()

    expect(next.value).eqls(select())
    next = saga.next('bye')

    expect(next.value).eqls(call(urlChanges.stateFromLocation, enhanced, 'bye', '/hi/there'))
    next = saga.next()

    expect(next).eqls({
      done: true,
      value: undefined
    })
  })
})
