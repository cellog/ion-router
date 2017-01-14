import React from 'react'
import ConnectLink, { Link } from '../src/Link'
import { push, replace } from '../src'
import { renderComponent } from './test_helper'

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
    const Far = () => <Link to="/hi" dispatch={() => null}><div>foo</div></Link>
    const component = renderComponent(Far, { dispatch, replace: '/hi' })
    expect(component.text()).eqls('foo')
  })
  it('dispatches actions', () => {
    const [ component, store, log ] = renderComponent(ConnectLink, { to: '/hi' }, {}, true)
    component.find('a').trigger('click')
    expect(log).eqls([push('/hi')])
  })
})