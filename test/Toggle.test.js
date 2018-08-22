import React from 'react'
import Toggle from '../src/Toggle'
import { renderComponent, sagaStore } from './test_helper'
import * as rtl from 'react-testing-library'

describe('Toggle', () => {
  beforeEach(() => rtl.cleanup())
  const Component = props => ( // eslint-disable-next-line
    <div>
      hi {Object.keys(props).map(prop => <div key={prop} data-testid={prop}>{props[prop]}</div>)}
    </div>
  )
  let Route, state // eslint-disable-line
  afterEach(() => rtl.cleanup())
  test('should not freak out if we don\'t initialize', () => {
    const R = Toggle(() => true)
    expect(() => renderComponent(R, { component: Component, foo: 'bar' }, { week: 1 }))
      .not.toThrow('call connectToggle with the connect function from react-redux to ' +
      'initialize Toggle (see https://github.com/cellog/ion-router/issues/1)')
  })
  describe('initialized', () => {
    let store
    beforeEach(() => {
      store = sagaStore(state)
      Route = Toggle((s, p) => {
        return s.week || p.week
      })
    })
    test('renders the component if the state tester returns true', async (done) => {
      const container = renderComponent(Route, { component: Component, foo: 'bar' }, { week: 1 }, false, store)
      await rtl.waitForElement(() => container.getByTestId('foo'))
      expect(container.getByTestId('foo')).toHaveTextContent('bar')
      done()
    })
    test(
      'renders the component if the state tester returns true from props',
      async (done) => {
        const container = renderComponent(Route, { component: Component, foo: 'bar', week: 1 }, { week: 0 })
        await rtl.waitForElement(() => container.getByTestId('foo'))
        expect(container.getByTestId('foo')).toHaveTextContent('bar')
        done()
      }
    )
    test('renders null if the state tester returns false', () => {
      const container = renderComponent(Route, { component: Component, foo: 'bar' }, { week: 0 })
      expect(container.queryByTestId('foo')).toBe(null)
    })
    test('renders else if the state tester returns false', () => {
      const Else = () => <div>else</div>
      const container = renderComponent(Route, { component: Component, else: Else }, { week: 0 })
      expect(container.getByText('else')).toHaveTextContent('else')
    })
    test('does not call state if loaded returns false', () => {
      const spy = jest.fn()
      spy.mockReturnValue(true)
      const loaded = jest.fn()
      loaded.mockReturnValue(false)
      const R = Toggle(spy, loaded)
      renderComponent(R, { component: Component, foo: 'bar', week: 1 }, { week: 0 })

      expect(spy.mock.calls.length).toBe(0)
      expect(loaded.mock.calls.length).toBe(1)
    })
    test('renders loading element if state is still loading', () => {
      const R = Toggle(() => true, () => false)
      const container = renderComponent(R,
        { component: Component, loadingComponent: () => <div>Loading...</div> }) // eslint-disable-line react/display-name
      expect(container.queryByText('Loading...')).not.toBe(null)
    })
    test('componentLoadingMap', () => {
      const R = Toggle(() => true, () => true, {
        component: 'bobby',
        loadingComponent: 'frenzel',
        else: 'blah'
      })
      const Show = (props) => (
        <ul>
          {Object.keys(props).map(prop => <li key={prop} data-testid={prop}>{JSON.stringify(props[prop])}</li>)}
        </ul>
      )
      const container = renderComponent(R, { component: Show, bobby: 'hi', frenzel: 'there', blah: 'oops' })
      expect(container.getByTestId('component')).toHaveTextContent('"hi"')
      expect(container.getByTestId('bobby')).toHaveTextContent('')
      expect(container.getByTestId('loadingComponent')).toHaveTextContent('"there"')
      expect(container.getByTestId('frenzel')).toHaveTextContent('')
      expect(container.getByTestId('else')).toHaveTextContent('"oops"')
      expect(container.getByTestId('blah')).toHaveTextContent('')
    })
    test('no specified component', () => {
      const R = Toggle(() => true, () => true)
      const J = () => <R>
        <div>testing</div>
      </R>
      const container = renderComponent(J)
      expect(container.queryByText('testing')).not.toBe(null)
    })
    test('renders children', () => {
      const R = Toggle(() => true, () => true)
      const J = props => <R>{props.children}</R> // eslint-disable-line
      const container = renderComponent(J, { children: <ul><li>hi</li><li>there</li></ul> })
      expect(container.queryByText('hi')).not.toBe(null)
      expect(container.queryByText('there')).not.toBe(null)
    })
  })
})
