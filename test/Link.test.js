import React from 'react'
import ConnectLink, { Link, connectLink } from '../src/Link'
import { push, replace } from '../src'
import { renderComponent, connect } from './test_helper'

describe('react-redux-saga-router Link', () => {
  it('dispatches replace', () => {
    const dispatch = sinon.spy()
    const component = renderComponent(Link, { dispatch, replace: '/hi' })
    component.find('a').trigger('click')
    expect(component.find('a').props('href')).eqls('/hi')
    expect(dispatch.called).is.true
    expect(dispatch.args[0]).eqls([replace('/hi')])
  })
  it('dispatches push', () => {
    const dispatch = sinon.spy()
    const component = renderComponent(Link, { dispatch, to: { pathname: '/hi', search: '?foo', hash: '#ar', state: { foo: 'bar' } } })
    component.find('a').trigger('click')
    expect(component.find('a').props('href')).eqls('/hi?foo#ar')
    expect(dispatch.called).is.true
    expect(dispatch.args[0]).eqls([push({ pathname: '/hi', search: '?foo', hash: '#ar', state: { foo: 'bar' } })])
  })
  it('renders children', () => {
    const dispatch = sinon.spy()
    const Far = () => <Link to="/hi" dispatch={() => null}><div>foo</div></Link> // eslint-disable-line
    const component = renderComponent(Far, { dispatch, replace: '/hi' })
    expect(component.text()).eqls('foo')
  })
  it('renders placeholder', () => {
    expect(() => {
      renderComponent(ConnectLink, { to: '/hi' }, {}, true)
    }).throws('call connectLink with the connect function from react-redux to ' +
      'initialize Link (see https://github.com/cellog/react-redux-saga-router/issues/1)')
  })
  it('connectLink', () => {
    const spy1 = sinon.spy()
    const spy = sinon.spy()
    const connect = (one) => {
      spy1(one)
      return spy
    }
    connectLink(connect)
    expect(spy1.called).is.true
    expect(spy.called).is.true

    expect(spy1.args[0][0]()).eqls({})
    expect(spy.args[0]).eqls([Link])
  })
  it('dispatches actions when initialized', () => {
    const spy = sinon.spy()
    connectLink(connect)
    const [component, , log] = renderComponent(ConnectLink, { to: '/hi', onClick: spy }, {}, true)
    component.find('a').trigger('click')
    expect(log).eqls([push('/hi')])
    expect(spy.called).is.true
  })
  it('errors (in dev) on href passed in', () => {
    connectLink(connect)
    expect(() => renderComponent(ConnectLink, { href: '/hi' }, {}, true))
      .throws('href should not be passed to Link, use "to" (passed "/hi")')
  })
})
