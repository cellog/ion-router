import React from 'react'
import ConnectedRoutes, { connectRoutes, RawRoutes } from '../src/Routes'
import { renderComponent, connect } from './test_helper'

describe('react-redux-saga-router Routes', () => {
  let component, store, log // eslint-disable-line
  function make(props = {}, Comp = ConnectedRoutes) {
    connectRoutes(connect)
    const info = renderComponent(Comp, props, {}, true)
    component = info[0]
    store = info[1]
    log = info[2]
  }
  it('errors (in dev) on href passed in', () => {
    expect(() => renderComponent(ConnectedRoutes, { href: '/hi' }, {}, true))
      .throws('call connectRoutes with the connect function from react-redux to ' +
        'initialize Routes (see https://github.com/cellog/react-redux-saga-router/issues/1)')
  })
  it('connectRoutes', () => {
    const spy1 = sinon.spy()
    const spy = sinon.spy()
    const connect = (one) => {
      spy1(one)
      return spy
    }
    connectRoutes(connect)
    expect(spy1.called).is.true
    expect(spy.called).is.true

    expect(spy.args[0]).eqls([RawRoutes])
  })

  it('passes in dispatch prop', () => {
    const Thing = ({ dispatch }) => { // eslint-disable-line
      expect(dispatch).is.instanceof(Function)
      return <div onClick={() => dispatch({ type: 'foo', payload: 'bar' })}>hi</div> // eslint-disable-line
    }
    const R = () => <ConnectedRoutes>
      <Thing />
    </ConnectedRoutes>
    make({}, R)
    component.find('div').trigger('click')
    expect(log).eqls([
      { type: 'foo', payload: 'bar' }
    ])
  })
})
