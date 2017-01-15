import RouteManager from '../src/RouteManager'
import RouteParser from 'route-parser'
import createHistory from 'history/createMemoryHistory'
import * as actions from '../src/actions'
import { put, take, select, call } from 'redux-saga/effects'

describe('Route', () => {
  describe('basics', () => {
    let route, history
    beforeEach(() => {
      history = createHistory({
        initialEntries: ['/test/hi/there']
      })
      route = new RouteManager(history, {
        name: 'test',
        path: '/test/:test(/:thing)',
      })
    })
    it('RouteManager constructor', () => {
      expect(route.name).eqls('test')
      expect(route.route).eqls(new RouteParser('/test/:test(/:thing)'))
    })
    it('url', () => {
      expect(route.url({
        test: 'foo',
        thing: 'bar'
      })).eqls('/test/foo/bar')
      expect(route.url({
        test: 'foo',
        thing: undefined
      })).eqls('/test/foo')
      expect(route.url({
      })).eqls(false)
    })
    it('match', () => {
      expect(route.match('/test/foo/bar')).eqls({
        test: 'foo',
        thing: 'bar'
      })
    })
  })
  describe('advanced', () => {
    let route, history, mystate
    beforeEach(() => {
      mystate = {
        testing: 'be',
        thing: 'there',
        routing: {
          location: {
            pathname: '/thing/hi',
            search: '',
            hash: ''
          },
          matchedRoutes: ['foo'],
          routes: {
            ids: ['foo'],
            url: '/thing/:test(/:thing1)',
            routes: {
              foo: {
                name: 'foo',
                params: {
                  test: 'hi',
                  thing1: undefined
                },
                state: {
                  testing: 'hi',
                  thing: undefined
                }
              }
            }
          }
        },
      }
      history = createHistory({
        initialEntries: ['/thing/:test(/:thing1)']
      })
      route = new RouteManager(history, {
        name: 'foo',
        path: '/test/:test(/:thing1)',
        paramsFromState: state => ({
          test: state.testing,
          thing1: state.thing
        }),
        stateFromParams: params => ({
          testing: params.test,
          thing: params.thing1
        }),
        updateState: {
          testing: test => ({ type: 'testing', payload: test }),
          thing: thing => ({ type: 'thing', payload: thing })
        }
      })
    })
    it('getState', () => {
      expect(route.getState({
        test: 'hi',
        thing1: 'there'
      })).eqls({
        testing: 'hi',
        thing: 'there'
      })
    })
    it('getParams', () => {
      expect(route.getParams({
        testing: 'hi',
        thing: 'there'
      })).eqls({
        test: 'hi',
        thing1: 'there'
      })
    })
    it('changed', () => {
      expect(route.changed({}, {
        test: 'hi',
        thing: 'there'
      })).eqls(['test', 'thing'])
      expect(route.changed({
        test: 'hi',
        thing: '2017'
      }, {
        test: 'hi',
        thing: 2017
      })).eqls(['thing'])
    })
    it('getStateUpdates', () => {
      expect(route.getStateUpdates(mystate, {
        test: 'hif',
        thing1: 'there'
      }, 'foo')).eqls([
        { type: 'testing', payload: 'hif' },
        { type: 'thing', payload: 'there' }
      ])
    })
    it('getUrlUpdate', () => {
      expect(route.getUrlUpdate(mystate, 'foo')).eqls('/test/be/there')
    })
    it('getUrlUpdate, no change', () => {
      mystate.testing = undefined
      mystate.thing = 'hi'
      expect(route.getUrlUpdate(mystate, 'foo')).eqls(false)
    })
    describe('sagas', () => {
      it('stateFromLocation', () => {
        const saga = route.stateFromLocation({
          pathname: '/test/hooya/burble',
          search: '',
          hash: ''
        })
        let next = saga.next()

        expect(next.value).eqls(select())
        next = saga.next(mystate)

        expect(next.value).eqls(put(actions.setParamsAndState('foo', {
          test: 'hooya',
          thing1: 'burble'
        }, {
          testing: 'hooya',
          thing: 'burble'
        })))
        next = saga.next()

        expect(next.value).eqls([put({ type: 'testing', payload: 'hooya' })])
        next = saga.next()

        expect(next.value).eqls([put({ type: 'thing', payload: 'burble' })])
        next = saga.next()

        expect(next).eqls({
          value: undefined,
          done: true
        })
      })
      it('stateFromLocation, no change, string url', () => {
        mystate.testing = 'hi'
        mystate.thing = undefined
        const saga = route.stateFromLocation('/test/hi')
        let next = saga.next()

        expect(next.value).eqls(select())
        next = saga.next(mystate)

        expect(next).eqls({
          value: undefined,
          done: true
        })
      })
      it('locationFromState', () => {
        const saga = route.locationFromState()
        let next = saga.next()

        expect(next.value).eqls(select())
        next = saga.next(mystate)

        expect(next.value).eqls(put(actions.setParamsAndState('foo', {
          test: 'be',
          thing1: 'there'
        }, {
          testing: 'be',
          thing: 'there'
        })))
        next = saga.next()

        expect(next.value).eqls(put(actions.push('/test/be/there')))
        next = saga.next()

        expect(next).eqls({
          value: undefined,
          done: true
        })
      })
      it('locationFromState, no change', () => {
        mystate.testing = 'hi'
        mystate.thing = undefined
        const saga = route.locationFromState()
        let next = saga.next()

        expect(next.value).eqls(select())
        next = saga.next(mystate)

        expect(next).eqls({
          value: undefined,
          done: true
        })
      })
      it('initState', () => {
        const saga = route.initState()
        let next = saga.next()

        expect(next.value).eqls(call([route, route.stateFromLocation], route.history.location))
        next = saga.next()

        expect(next).eqls({
          value: undefined,
          done: true
        })
      })
      it('monitorState', () => {
        const saga = route.monitorState()
        let next = saga.next()

        expect(next.value).eqls(take('*'))
        next = saga.next()

        expect(next.value).eqls(call([route, route.locationFromState]))
        next = saga.next()

        expect(next.value).eqls(take('*'))
      })
      it('monitorUrl', () => {
        const saga = route.monitorUrl('/hi')
        let next = saga.next()

        expect(next.value).eqls(call([route, route.stateFromLocation], '/hi'))
        next = saga.next()

        expect(next).eqls({
          value: undefined,
          done: true
        })
      })
    })
  })
})