import React from 'react'
import { Provider } from 'react-redux'
import ConnectedRoutes from '../src/Routes'
import Route, {fake} from '../src/Route'
import Context from '../src/Context'
import * as enhancers from '../src/enhancers'
import { renderComponent, sagaStore } from './test_helper'
import * as actions from "../src/actions"
import * as rtl from 'react-testing-library'
import 'react-testing-library/cleanup-after-each'

describe('Routes', () => {
  let component, store, log, CompClass // eslint-disable-line
  function make(props = {}, Comp = ConnectedRoutes, state = {}, mount = false, s = undefined) {
    const things = sagaStore(state)
    store = (s && s.store) || things.store
    log = s ? log : things.log
    const My = props => (
      <Provider store={store}>
        <Comp {...props} />
      </Provider>
    )

    const info = renderComponent(My, props, state, true, s, mount)
    component = info[0]
    store = info[1]
    log = info[2]
    CompClass = info[3]
  }
  test('correct prop dispersion', () => {
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
    const Checker = props => (
      <div>
        <button onClick={() => props.dispatch({type: 'hi'})}>click</button>
        <ul>
          {Object.keys(props).map(prop => <li key={prop} data-testid="prop">{prop}</li>)}
        </ul>
      </div>
    )
    const Thing = () => (
      <Context.Consumer>
        {info => <Checker {...info} />}
      </Context.Consumer>
    )
    const R = ({ s }) => <ConnectedRoutes store={s}>
      <Thing />
    </ConnectedRoutes>
    make({ s: mystore.store }, R, {}, false, mystore)
    expect(component.getAllByTestId('prop')).toHaveLength(4)
    expect(component.queryByText('dispatch')).not.toBe(null)
    expect(component.queryByText('routes')).not.toBe(null)
    expect(component.queryByText('addRoute')).not.toBe(null)
    expect(component.queryByText('store')).not.toBe(null)
    rtl.fireEvent.click(component.getByText('click'))
    expect(mystore.log[1]).toEqual(
      {type: 'hi'}
    )
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
    const Checker = props => (
      <div>
        <ul>
          {Object.keys(props).map(prop => <li key={prop} data-testid={prop}>{JSON.stringify(props[prop])}</li>)}
        </ul>
      </div>
    )
    const Thing = () => (
      <Context.Consumer>
        {info => <Checker {...info} />}
      </Context.Consumer>
    )
    const R = () => <ConnectedRoutes store={mystore.store}>
      <Thing />
    </ConnectedRoutes>
    make({}, R, undefined, false, mystore)
    expect(component.getByTestId('routes')).toHaveTextContent(JSON.stringify(mystore.store.getState().routing.routes.routes))
  })
  test('multiple Route children', () => {
    const Thing = () => (
      <ConnectedRoutes>
        <div className="hi">hi</div>
        <div className="there">there</div>
      </ConnectedRoutes>
    )
    make({}, Thing)
    expect(component.queryByText('hi')).not.toBe(null)
    expect(component.queryByText('there')).not.toBe(null)
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
    expect(s.dispatch).toHaveBeenCalledTimes(0)
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
      make({ s: mystore.store }, Thing, {}, false, mystore)
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
