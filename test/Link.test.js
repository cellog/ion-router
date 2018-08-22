import React, { Children }  from 'react'

import ConnectLink, { Link } from '../src/Link'
import { push, replace } from '../src/actions'
import { renderComponent } from './test_helper'
import * as rtl from 'react-testing-library'
import 'react-testing-library/cleanup-after-each'
import * as dom from 'dom-testing-library'

describe('Link', () => {
  const Show = (props) => (
    <Link {...props}>
      hi
    </Link>
  )
  test('outside proper context', () => {
    const props = {
      route: 'hi',
      there: 'baby',
      __routeInfo: {
        dispatch: jest.fn(() => {}),
        routes: {
          hi: {
            name: 'hi',
            path: '/hi/:there'
          }
        }
      },
    }
    const dispatch = props.__routeInfo.dispatch
    const component = renderComponent(Show, props)

    rtl.fireEvent.click(component.getByText('hi'))
    expect(dispatch).toHaveBeenCalledWith(push('/hi/baby'))
  })
  test('dispatches replace', () => {
    const dispatch = jest.fn()
    const component = renderComponent(Show, { __routeInfo: { dispatch }, replace: '/hi' })
    rtl.fireEvent.click(component.getByText('hi'))
    expect(dispatch).toHaveBeenCalledWith(replace('/hi'))
  })
  test('dispatches push', () => {
    const dispatch = jest.fn()
    const component = renderComponent(Show, { __routeInfo: { dispatch }, to: { pathname: '/hi', search: '?foo', hash: '#ar', state: { foo: 'bar' } } })
    rtl.fireEvent.click(component.getByText('hi'))
    expect(dispatch).toHaveBeenCalledWith(push({ pathname: '/hi', search: '?foo', hash: '#ar', state: { foo: 'bar' } }))
  })
  test('calls original onClick', () => {
    const dispatch = jest.fn()
    const onClick = jest.fn()
    const component = renderComponent(Show, {
      __routeInfo: { dispatch },
      to: {
        pathname: '/hi',
        search: '?foo',
        hash: '#ar',
        state: { foo: 'bar' }
      },
      onClick
    })
    rtl.fireEvent.click(component.getByText('hi'))
    expect(dispatch.mock.calls.length).toBe(1)
    expect(dispatch.mock.calls[0]).toEqual([push({ pathname: '/hi', search: '?foo', hash: '#ar', state: { foo: 'bar' } })])
    expect(onClick).toBeCalledWith(expect.objectContaining({ target: null }))
  })
  test('renders children', () => {
    const dispatch = jest.fn()
    const Far = () => <Link to="/hi" dispatch={() => null}><div>foo</div></Link> // eslint-disable-line
    const component = renderComponent(Far, { dispatch, replace: '/hi' })
    expect(component.queryByText('foo')).not.toBe(null)
  })
  test('dispatches actions when initialized', () => {
  })
  describe('errors', () => {
    let c
    beforeEach(() => {
      c = console.error // eslint-disable-line
      console.error = () => null // eslint-disable-line
    })
    afterEach(() => {
      console.error = c // eslint-disable-line
    })
    test('errors (in dev) on href passed in', () => {
      expect(() => renderComponent(ConnectLink, { __routeInfo: { dispatch: () => null }, href: '/hi' }, {}, true))
        .toThrow('href should not be passed to Link, use "to," "replace" or "route" (passed "/hi")')
    })
  })
  describe('generates the correct path when route option is used', () => {
    test('push', () => {
      const dispatch = jest.fn()
      const component = renderComponent(Show, {
        route: 'hi',
        there: 'baby',
        __routeInfo: {
          dispatch,
          routes: {
            hi: {
              name: 'hi',
              path: '/hi/:there'
            }
          }
        },
      })
      rtl.fireEvent.click(component.getByText('hi'))
      expect(dispatch).toBeCalledWith(push('/hi/baby'))
    })
    test('replace', () => {
      const dispatch = jest.fn()
      const component = renderComponent(Show, {
        route: 'hi',
        there: 'baby',
        replace: true,
        __routeInfo: {
          dispatch,
          routes: {
            hi: {
              name: 'hi',
              path: '/hi/:there'
            }
          }
        },
      })
      rtl.fireEvent.click(component.getByText('hi'))
      expect(dispatch).toBeCalledWith(replace('/hi/baby'))
    })
    test('replaces route when props change', () => {
      let dispatch = jest.fn()
      const component = rtl.render(
        <Show
          route='hi'
          there='baby'
          replace={true}
          __routeInfo={{
          dispatch,
          routes: {
            hi: {
              name: 'hi',
              path: '/hi/:there'
            },
            there: {
              name: 'there',
              path: '/there/:there'
            }
          }}} />)
      rtl.fireEvent.click(component.getByText('hi'))
      expect(dispatch).toBeCalledWith(replace('/hi/baby'))
      dispatch = jest.fn()
      component.rerender(<Show
        route='there'
        there='baby'
        replace={true}
        __routeInfo={{
          dispatch,
          routes: {
            hi: {
              name: 'hi',
              path: '/hi/:there'
            },
            there: {
              name: 'there',
              path: '/there/:there'
            }
          }}} />)
      rtl.fireEvent.click(component.getByText('hi'))
      expect(dispatch).toBeCalledWith(replace('/there/baby'))
    })
  })

  test('only valid props are passed to the a tag', () => {
    const PropGetter = ({ children }) => {
      const props = Children.toArray(children)[0].props
      return (
        <ul>
          {Object.keys(props).map(prop => <li key={prop}>{prop}</li>)}
        </ul>
      )
    }
    const Me = props => (
      <PropGetter>
        <Link {...props}>hi</Link>
      </PropGetter>
    )
    const component = renderComponent(Me, {
      ...[
        'download', 'hrefLang', 'referrerPolicy', 'rel', 'target', 'type',
        'id', 'accessKey', 'className', 'contentEditable', 'contextMenu', 'dir', 'draggable',
        'hidden', 'itemID', 'itemProp', 'itemRef', 'itemScope', 'itemType', 'lang',
        'spellCheck', 'style', 'tabIndex', 'title'
      ].reduce((coll, item) => ({ ...coll, [item]: {} }), {}),
      'data-hi': 'there',
      foo: 'bar',
      to: 'hi',
      dispatch: () => null,
    })
    const a = [
      'download', 'hrefLang', 'referrerPolicy', 'rel', 'target', 'type',
        'id', 'accessKey', 'className', 'contentEditable', 'contextMenu', 'dir', 'draggable',
        'hidden', 'itemID', 'itemProp', 'itemRef', 'itemScope', 'itemType', 'lang',
        'spellCheck', 'style', 'tabIndex', 'title',

        'data-hi', 'children'
      ]
    a.forEach(prop => expect(component.queryByText(prop)).not.toBe(null))
  })
})