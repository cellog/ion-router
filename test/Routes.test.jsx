import React, { Component } from 'react'
import ConnectedRoutes, { connectRoutes, RawRoutes } from '../src/Routes'
import * as actions from '../src/actions'
import * as enhancers from '../src/enhancers'
import { renderComponent, connect, sagaStore } from './test_helper'

describe('Routes', () => {
  let component, store, log // eslint-disable-line
  function make(props = {}, Comp = ConnectedRoutes, state = {}, mount = false, s = undefined) {
    connectRoutes(connect)
    const info = renderComponent(Comp, props, state, true, s, mount)
    component = info[0]
    store = info[1]
    log = info[2]
  }
  it('errors (in dev) on href passed in', () => {
    expect(() => renderComponent(ConnectedRoutes, { href: '/hi' }, {}, true))
      .throws('call connectRoutes with the connect function from react-redux to ' +
        'initialize Routes (see https://github.com/cellog/ion-router/issues/1)')
  })
  it('connectRoutes', () => {
    const spy1 = sinon.spy()
    const spy = sinon.spy()
    const connect = (one) => {
      spy1(one)
      return spy
    }
    const raw = RawRoutes('store')
    connectRoutes(connect, 'store', raw)
    expect(spy1.called).is.true
    expect(spy.called).is.true

    expect(spy.args[0]).eqls([raw])
  })

  it('passes in @@AddRoute prop', () => {
    class Thing extends Component {
      constructor(props) {
        super(props)
        expect(props['@@AddRoute']).is.instanceof(Function) // eslint-disable-line
        props['@@AddRoute']({ name: 'foo', path: '/bar' }) // eslint-disable-line
      }

      render() {
        return <div />
      }
    }
    const R = ({ thing }) => ( // eslint-disable-line
      <div>
        {
          thing ?
            <ConnectedRoutes>
              <Thing />
            </ConnectedRoutes> : <div>foo</div>
        }
      </div>
    )
    make({ thing: true }, R, {}, true)
    component.props({ thing: false })

    expect(log).eqls([
      actions.route({ pathname: '/',
        search: '',
        hash: '',
        state: undefined,
        key: undefined }),
      actions.batchRoutes([{ name: 'foo', path: '/bar' }]),
      actions.batchRemoveRoutes([{ name: 'foo', path: '/bar' }])
    ])
    component.unmount()
  })
  it('passes in routes from state', () => {
    const Thing = () => <div />
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
    expect(component.find(Thing).props('@@__routes')).eqls({
      hi: {
        name: 'hi',
        path: '/there'
      }
    })
  })
  it('multiple Route children', () => {
    const Thing = (
      <ConnectedRoutes>
        <div className="hi">hi</div>
        <div className="there">there</div>
      </ConnectedRoutes>
    )
    make(Thing)
    expect(component.props('props').children).has.length(2)
    expect(component.props('props').children[0].props.className).eqls('hi')
    expect(component.props('props').children[1].props.className).eqls('there')
  })
  describe('server', () => {
    it('addRoute', () => {
      class Thing extends Component {
        constructor(props) {
          super(props)
          expect(props['@@AddRoute']).is.instanceof(Function) // eslint-disable-line
          props['@@AddRoute']({ name: 'foo', path: '/bar' }) // eslint-disable-line
        }

        render() {
          return <div />
        }
      }
      const R = () => <ConnectedRoutes>
        <Thing />
      </ConnectedRoutes>
      const mystore = sagaStore()
      mystore.store.routerOptions.isServer = true
      make({}, R, undefined, false, mystore)
      expect(log).eqls([
        actions.route({ pathname: '/',
          search: '',
          hash: '',
          state: undefined,
          key: undefined }),
        actions.addRoute({ name: 'foo', path: '/bar' }),
        actions.batchRoutes([{ name: 'foo', path: '/bar' }])
      ])
    })
  })
})
