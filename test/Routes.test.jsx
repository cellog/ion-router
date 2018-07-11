import React from 'react'
import ConnectedRoutes from '../src/Routes'
import Context from '../src/Context'
import * as enhancers from '../src/enhancers'
import { renderComponent, sagaStore } from './test_helper'

jest.mock('../src/Context')

describe('Routes', () => {
  let component, store, log // eslint-disable-line
  function make(props = { store }, Comp = ConnectedRoutes, state = {}, mount = false, s = undefined) {
    const info = renderComponent(Comp, props, state, true, s, mount)
    component = info[0]
    store = info[1]
    log = info[2]
  }
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
    const Thing = (
      <ConnectedRoutes>
        <div className="hi">hi</div>
        <div className="there">there</div>
      </ConnectedRoutes>
    )
    make(Thing)
    expect(component.prop('props').children).toHaveLength(2)
    expect(component.prop('props').children[0].props.className).toBe('hi')
    expect(component.prop('props').children[1].props.className).toBe('there')
  })
  describe('server', () => {
  })
})
