import React from 'react'
import { If, Else, Loading } from '../src/If'
import { renderComponent } from './test_helper'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import * as rtl from 'react-testing-library'

describe('If/Else', () => {
  afterEach(() => rtl.cleanup())
  const delay = ms => new Promise(resolve => setTimeout(() => resolve(), ms))
  describe('initialized', () => {
    test('renders the component if the state tester returns true', async (done) => {
      const store = createStore((state = { hi: 0 }, action) => {
        if (action.type === 'hi') {
          return { hi: state.hi + 1}
        }
        return state
      })
      const Test = () => (
        <Provider store={store}>
          <If selector={state => state.hi}>
            <div>hi</div>
            <div>other</div>
          </If>
        </Provider>
      )
      const container = renderComponent(Test)
      expect(container.queryByText('hi')).toBe(null)
      expect(container.queryByText('other')).toBe(null)
      store.dispatch({ type: 'hi' })
      await rtl.waitForElement(() => container.getByText('hi'))
      expect(container.queryByText('hi')).not.toBe(null)
      expect(container.queryByText('other')).not.toBe(null)
      done()
    })
  })
  test('renders the else if the state tester returns false', async (done) => {
    const store = createStore((state = { hi: 0}, action) => {
      if (action.type === 'hi') return { hi: state.hi + 1}
      return state
    })
    const Test = () => (
      <Provider store={store}>
        <If selector={state => state.hi}>
          <div>hi</div>
          <div>other</div>
          <Else>
            <div>else</div>
          </Else>
        </If>
      </Provider>
    )
    const container = renderComponent(Test)
    await rtl.waitForElement(() => container.getByText('else'))
    expect(container.queryByText('else')).not.toBe(null)
    expect(container.queryByText('hi')).toBe(null)
    expect(container.queryByText('other')).toBe(null)
    store.dispatch({ type: 'hi' })
    await rtl.waitForElement(() => container.getByText('hi'))
    expect(container.queryByText('hi')).not.toBe(null)
    expect(container.queryByText('other')).not.toBe(null)
    expect(container.queryByText('else')).toBe(null)
    done()
  })
  test('renders nothing if loading and no loading component', async (done) => {
    const store = createStore((state = { hi: 0}, action) => {
      if (action.type === 'hi') return { hi: state.hi + 1}
      return state
    })
    const Test = () => (
      <Provider store={store}>
        <If selector={state => state.hi} loadedSelector={state => state.hi > 1}>
          <div>hi</div>
          <div>other</div>
          <Else>
            <div>else</div>
          </Else>
        </If>
        <div>loaded</div>
      </Provider>
    )
    const container = renderComponent(Test)
    await rtl.waitForElement(() => container.getByText('loaded'))
    expect(container.queryByText('hi')).toBe(null)
    expect(container.queryByText('other')).toBe(null)
    expect(container.queryByText('else')).toBe(null)
    store.dispatch({ type: 'hi' })
    await rtl.waitForElement(() => container.getByText('loaded'))
    expect(container.queryByText('hi')).toBe(null)
    expect(container.queryByText('other')).toBe(null)
    expect(container.queryByText('else')).toBe(null)
    store.dispatch({ type: 'hi' })
    await rtl.waitForElement(() => container.getByText('hi'))
    expect(container.queryByText('hi')).not.toBe(null)
    expect(container.queryByText('other')).not.toBe(null)
    expect(container.queryByText('else')).toBe(null)
    done()
  })
  test('renders loading components if loading', async (done) => {
    const store = createStore((state = { hi: 0}, action) => {
      if (action.type === 'hi') return { hi: state.hi + 1}
      return state
    })
    const Test = () => (
      <Provider store={store}>
        <If selector={state => state.hi} loadedSelector={state => state.hi > 1}>
          <div>hi</div>
          <div>other</div>
          <Else>
            <div>else</div>
          </Else>
          <Loading>
            <div>loading...</div>
            <div>a lot...</div>
          </Loading>
        </If>
      </Provider>
    )
    const container = renderComponent(Test)
    await rtl.waitForElement(() => container.getByText('loading...'))
    expect(container.queryByText('hi')).toBe(null)
    expect(container.queryByText('other')).toBe(null)
    expect(container.queryByText('else')).toBe(null)
    expect(container.queryByText('loading...')).not.toBe(null)
    expect(container.queryByText('a lot...')).not.toBe(null)
    store.dispatch({ type: 'hi' })
    await rtl.waitForElement(() => container.getByText('loading...'))
    expect(container.queryByText('hi')).toBe(null)
    expect(container.queryByText('other')).toBe(null)
    expect(container.queryByText('else')).toBe(null)
    expect(container.queryByText('loading...')).not.toBe(null)
    expect(container.queryByText('a lot...')).not.toBe(null)
    store.dispatch({ type: 'hi' })
    await rtl.waitForElement(() => container.getByText('hi'))
    expect(container.queryByText('hi')).not.toBe(null)
    expect(container.queryByText('other')).not.toBe(null)
    expect(container.queryByText('else')).toBe(null)
    expect(container.queryByText('loading...')).toBe(null)
    expect(container.queryByText('a lot...')).toBe(null)
    done()
  })
  test('renders no loading components if within timeout of loading', async (done) => {
    const store = createStore((state = { hi: 0}, action) => {
      if (action.type === 'hi') return { hi: state.hi + 1}
      return state
    })
    const Test = () => (
      <Provider store={store}>
        <If selector={state => state.hi} loadedSelector={state => state.hi > 1} loadingDelayMs={1000}>
          <div>hi</div>
          <div>other</div>
          <Else>
            <div>else</div>
          </Else>
          <Loading>
            <div>loading...</div>
            <div>a lot...</div>
          </Loading>
        </If>
      </Provider>
    )
    const container = renderComponent(Test)
    expect(container.queryByText('hi')).toBe(null)
    expect(container.queryByText('other')).toBe(null)
    expect(container.queryByText('else')).toBe(null)
    expect(container.queryByText('loading...')).toBe(null)
    expect(container.queryByText('a lot...')).toBe(null)
    store.dispatch({ type: 'hi' })
    await delay(1100)
    expect(container.queryByText('hi')).toBe(null)
    expect(container.queryByText('other')).toBe(null)
    expect(container.queryByText('else')).toBe(null)
    expect(container.queryByText('loading...')).not.toBe(null)
    expect(container.queryByText('a lot...')).not.toBe(null)
    store.dispatch({ type: 'hi' })
    await rtl.waitForElement(() => container.getByText('hi'))
    expect(container.queryByText('hi')).not.toBe(null)
    expect(container.queryByText('other')).not.toBe(null)
    expect(container.queryByText('else')).toBe(null)
    expect(container.queryByText('loading...')).toBe(null)
    expect(container.queryByText('a lot...')).toBe(null)
    done()
  })
  test('does not render elements when selector does not match', async (done) => {
    const store = createStore((state = { hi: 0 }, action) => {
      if (action.type === 'hi') return { hi: state.hi + 1}
      return state
    })
    const hi = 1
    const Throws = () => (
      <div>{hi.map(() => 'oops')}</div>
    )
    const Test = () => {
      return <Provider store={store}>
        <If selector={state => state.hi}>
          <div>hi</div>
          <Throws />
          <Else>
            <div>hi again</div>
          </Else>
        </If>
      </Provider>
    }
    expect(() => renderComponent(Test)).not.toThrow()
    const container = renderComponent(Test)
    await rtl.waitForElement(() => container.getByText('hi again'))
    expect(container.queryByText('hi again')).not.toBe(null)
    done()
  })
  test('does not render else elements when selector does match', async (done) => {
    const store = createStore((state = { hi: 1 }, action) => {
      if (action.type === 'hi') return { hi: state.hi + 1}
      return state
    })
    const hi = 1
    const Throws = () => (
      <div>{hi.map(() => 'oops')}</div>
    )
    const Test = () => (
      <Provider store={store}>
        <If selector={state => state.hi}>
          <div>hi</div>
          <Else>
            <div>hi again</div>
            <Throws />
          </Else>
        </If>
      </Provider>
    )
    expect(() => renderComponent(Test)).not.toThrow()
    const container = renderComponent(Test)
    await rtl.waitForElement(() => container.getByText('hi'))
    expect(container.queryByText('hi')).not.toBe(null)
    expect(container.queryByText('hi again')).toBe(null)
    done()
  })
})
