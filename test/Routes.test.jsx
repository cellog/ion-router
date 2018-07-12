import React from 'react'
import ConnectedRoutes from '../src/Routes'
import Route, {fake} from '../src/Route'
import Context from '../src/Context'
import * as enhancers from '../src/enhancers'
import { renderComponent, sagaStore } from './test_helper'
import * as actions from "../src/actions";

jest.mock('../src/Context')

describe('Routes', () => {
  let component, store, log // eslint-disable-line
  function make(props = {}, Comp = ConnectedRoutes, state = {}, mount = false, s = undefined) {
    const info = renderComponent(Comp, props, state, true, s, mount)
    component = info[0]
    store = info[1]
    log = info[2]
  }
  test('does not set up context if no store passed', () => {
    make()
    expect(component.find(Context.Provider).length).toBe(0)
  })
  test('updates store when props change', () => {
    const mystore = sagaStore({
      routing: {
        matchedRoutes: [],
        location: {
          pathname: '',
          hash: '',
          search: ''
        },
        routes: {
          ids: ['hi'],
          routes: {
            hi: {
              name: 'hi',
              path: '/there'
            }
          }
        }
      }
    })
    mystore.store.routerOptions.enhancedRoutes = enhancers.save({
      name: 'hi',
      path: '/there'
    }, {})
    const newstore = sagaStore({
      routing: {
        matchedRoutes: [],
        location: {
          pathname: '',
          hash: '',
          search: ''
        },
        routes: {
          ids: ['wow'],
          routes: {
            wow: {
              name: 'wow',
              path: '/wow'
            }
          }
        }
      }
    })
    newstore.store.routerOptions.enhancedRoutes = enhancers.save({
      name: 'wow',
      path: '/wow'
    }, {})
    const Checker = () => <div />
    const Thing = () => (
      <Context.Consumer>
        {info => <Checker {...info} />}
      </Context.Consumer>
    )
    const R = ({ s }) => <ConnectedRoutes store={s}>
      <Thing />
    </ConnectedRoutes>
    make({ s: mystore.store }, R, {}, false, mystore)
    expect(Object.keys(component.find(Checker).props())).toEqual([
      'dispatch', 'routes', 'addRoute', 'store'
    ])
    expect(component.find(Context.Provider).length).toBe(1)
    expect(component.find(Checker).prop('dispatch')).toBe(mystore.store.dispatch)
    expect(component.find(Checker).prop('routes')).toEqual(mystore.store.getState().routing.routes.routes)
    expect(component.find(Checker).prop('store')).toBe(mystore.store)

    component.setProps({ s: newstore.store })
    component.update()
    expect(component.find(Checker).prop('dispatch')).toBe(newstore.store.dispatch)
  })
  test('passes in routes from state', () => {
    const mystore = sagaStore({
      routing: {
        matchedRoutes: [],
        location: {
          pathname: '',
          hash: '',
          search: ''
        },
        routes: {
          ids: ['hi'],
          routes: {
            hi: {
              name: 'hi',
              path: '/there'
            }
          }
        }
      }
    })
    mystore.store.routerOptions.enhancedRoutes = enhancers.save({
      name: 'hi',
      path: '/there'
    }, {})
    const Checker = () => <div />
    const Thing = () => (
      <Context.Consumer>
        {info => <Checker {...info} />}
      </Context.Consumer>
    )
    const R = () => <ConnectedRoutes store={mystore.store}>
      <Thing />
    </ConnectedRoutes>
    make({}, R, undefined, false, mystore)
    expect(Object.keys(component.find(Checker).props())).toEqual([
      'dispatch', 'routes', 'addRoute', 'store'
    ])
    expect(component.find(Checker).prop('dispatch')).toBe(mystore.store.dispatch)
    expect(component.find(Checker).prop('routes')).toEqual(mystore.store.getState().routing.routes.routes)
    expect(component.find(Checker).prop('store')).toBe(mystore.store)
  })
  test('multiple Route children', () => {
    const Thing = () => (
      <ConnectedRoutes>
        <div className="hi">hi</div>
        <div className="there">there</div>
      </ConnectedRoutes>
    )
    make({}, Thing)
    expect(component.find(ConnectedRoutes).prop('children')).toHaveLength(2)
    expect(component.find(ConnectedRoutes).prop('children')[0].props.className).toBe('hi')
    expect(component.find(ConnectedRoutes).prop('children')[1].props.className).toBe('there')
  })
  test('unmount', () => {
    const unsubscribe = jest.fn()
    const s = {
      routerOptions: {
        isServer: false
      },
      dispatch: jest.fn(),
      getState: jest.fn(() => ({
        routing: {
          routes: {
            routes: {

            }
          }
        }
      })),
      subscribe: () => unsubscribe
    }
    const Thing = ({ s }) => (
      <ConnectedRoutes store={s}>
        <div className="hi">hi</div>
        <div className="there">there</div>
      </ConnectedRoutes>
    )
    make({ s }, Thing)
    component.unmount()
    expect(unsubscribe).toBeCalled()
    expect(s.dispatch).toHaveBeenCalledTimes(0)
  })
  test('unmount with existing routes', () => {
    const unsubscribe = jest.fn()
    const s = {
      routerOptions: {
        isServer: false
      },
      dispatch: jest.fn(),
      getState: jest.fn(() => ({
        routing: {
          routes: {
            routes: {
            }
          }
        }
      })),
      subscribe: () => unsubscribe
    }
    const Thing = ({ s }) => (
      <ConnectedRoutes store={s}>
        <Route
          name="test"
          path="hi/"
        />
      </ConnectedRoutes>
    )
    make({ s }, Thing)
    component.unmount()
    expect(unsubscribe).toBeCalled()
    expect(s.dispatch).toHaveBeenCalledTimes(2)
    expect(s.dispatch).toHaveBeenNthCalledWith(1, actions.batchRoutes([{
      name: 'test',
      path: 'hi/',
      paramsFromState: fake,
      stateFromParams: fake,
      updateState: {}
    }]))
    expect(s.dispatch).toHaveBeenNthCalledWith(2, actions.batchRemoveRoutes([{
      name: 'test',
      path: 'hi/',
      paramsFromState: fake,
      stateFromParams: fake,
      updateState: {}
    }]))
  })
  describe('server', () => {
    test('route setup', () => {
      const mystore = sagaStore({
        routing: {
          matchedRoutes: [],
          location: {
            pathname: '',
            hash: '',
            search: ''
          },
          routes: {
            ids: [],
            routes: {
            }
          }
        }
      })
      mystore.store.routerOptions.isServer = true
      const Thing = ({ s }) => (
        <ConnectedRoutes store={s}>
          <Route
            name="test"
            path="hi/"
          />
        </ConnectedRoutes>
      )
      mystore.store.dispatch = jest.fn(mystore.store.dispatch)
      make({ s: mystore.store }, Thing)
      expect(mystore.store.dispatch.mock.calls).toEqual([[
        actions.addRoute({
          name: 'test',
          path: 'hi/',
          paramsFromState: fake,
          stateFromParams: fake,
          updateState: {}
        })],
        [actions.batchRoutes([{
          name: 'test',
          path: 'hi/',
          paramsFromState: fake,
          stateFromParams: fake,
          updateState: {}
        }])]
      ])
    })
  })
})
