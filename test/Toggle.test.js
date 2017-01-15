import React from 'react'
import Toggle from '../src/Toggle'
import DisplaysChildren from '../src/DisplaysChildren'
import { renderComponent } from './test_helper'

describe('Toggle', () => {
  const Component = props => ( // eslint-disable-next-line
    <div>
      hi {Object.keys(props).map(prop => <div key={prop} className={prop}>{props[prop]}</div>)}
    </div>
  )
  let Route, state // eslint-disable-line
  beforeEach(() => {
    Route = Toggle((s, p) => s.week || p.week)
  })
  it('renders the component if the state tester returns true', () => {
    const container = renderComponent(Route, { component: Component, foo: 'bar' }, { week: 1 })
    expect(container.find(Component)).has.length(1)
    expect(container.find('.foo')).has.length(1)
    expect(container.find('.foo').text()).eqls('bar')
  })
  it('renders the component if the state tester returns true from props', () => {
    const container = renderComponent(Route, { component: Component, foo: 'bar', week: 1 }, { week: 0 })
    expect(container.find(Component)).has.length(1)
    expect(container.find('.foo')).has.length(1)
    expect(container.find('.foo').text()).eqls('bar')
  })
  it('renders null if the state tester returns false', () => {
    const container = renderComponent(Route, { component: Component, foo: 'bar' }, { week: 0 })
    expect(container.find(Component)).has.length(0)
    expect(container.text()).eqls('')
  })
  it('does not call state if loaded returns false', () => {
    const spy = sinon.spy(() => true)
    const loaded = sinon.spy(() => false)
    const R = Toggle(spy, loaded)
    const container = renderComponent(R, { component: Component, foo: 'bar', week: 1 }, { week: 0 })

    expect(spy.called).is.false
    expect(loaded.called).is.true
    expect(container.find(Component)).has.length(0)
  })
  it('renders loading element if state is still loading', () => {
    const R = Toggle(() => true, () => false)
    const container = renderComponent(R,
      { component: Component, loading: () => <div>Loading...</div> })
    expect(container.find(Component)).has.length(0)
    expect(container.text()).eqls('Loading...')
  })
  it('componentLoadingMap', () => {
    const R = Toggle(() => true, () => true, {
      component: 'bobby',
      loading: 'frenzel'
    })
    const container = renderComponent(R, { component: Component, bobby: 'hi', frenzel: 'there' })
    expect(container.find(Component)).has.length(1)
    expect(container.find(Component).props('component')).eqls('hi')
    expect(container.find(Component).props('bobby')).eqls(undefined)
    expect(container.find(Component).props('loading')).eqls('there')
    expect(container.find(Component).props('frenzel')).eqls(undefined)
  })
  it('no specified component', () => {
    const R = Toggle(() => true, () => true)
    const J = () => <R>
      testing
    </R>
    const container = renderComponent(J)
    expect(container.find(DisplaysChildren)).has.length(1)
    expect(container.text()).eqls('testing')
  })
  it('renders children', () => {
    const R = Toggle(() => true, () => true)
    const J = props => <R> {props.children}</R> // eslint-disable-line
    const container = renderComponent(J, { children: <ul><li>hi</li><li>there</li></ul> })
    expect(container.text()).eqls(' hithere')
  })
})
