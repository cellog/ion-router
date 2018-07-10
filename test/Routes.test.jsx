import React, { Component } from 'react'
import ConnectedRoutes, { RawRoutes } from '../src/Routes'
import Context from '../src/Context'
import * as actions from '../src/actions'
import * as enhancers from '../src/enhancers'
import { renderComponent, connect, sagaStore } from './test_helper'

describe('Routes', () => {
  let component, store, log // eslint-disable-line
  function make(props = { store }, Comp = ConnectedRoutes, state = {}, mount = false, s = undefined) {
    const info = renderComponent(Comp, props, state, true, s, mount)
    component = info[0]
    store = info[1]
    log = info[2]
  }
  test('passes in routes from state', () => {
    const Thing = () => (
      <Context.Consumer>
        {info => <div {...info} />}
      </Context.Consumer>
    )
    const R = () => <ConnectedRoutes>
      <Thing />
    </ConnectedRoutes>
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
    make({}, R, undefined, false, mystore)
    expect(component.find(Thing).props('@@__routes')).toBe({
      hi: {
        name: 'hi',
        path: '/there'
      }
    })
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
