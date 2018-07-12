import React, { SyntheticEvent }  from 'react'

import ConnectLink, { Link } from '../src/Link'
import { push, replace } from '../src/actions'
import { renderComponent } from './test_helper'
import RouteParser from "route-parser";


describe('Link', () => {
  test('outside proper context', () => {
    const component = renderComponent(Link, {
      route: 'hi',
      there: 'baby',
      __routeInfo: {
        dispatch: () => null,
        routes: {
          hi: {
            name: 'hi',
            path: '/hi/:there'
          }
        }
      },
    })
    expect(component.find(Link).instance().state.route).toEqual(new RouteParser('/hi/:there'))
    const nowState = component.find(Link).instance().state.route
    component.props({})
    component.update()
    expect(component.find(Link).instance().state.route).toBe(nowState)
  })
  test('dispatches replace', () => {
    const dispatch = jest.fn()
    const component = renderComponent(Link, { __routeInfo: { dispatch }, replace: '/hi' })
    component.find('a').simulate('click')
    expect(component.find('a').prop('href')).toEqual('/hi')
    expect(dispatch.mock.calls.length).toBe(1)
    expect(dispatch.mock.calls[0]).toEqual([replace('/hi')])
  })
  test('dispatches push', () => {
    const dispatch = jest.fn()
    const component = renderComponent(Link, { __routeInfo: { dispatch }, to: { pathname: '/hi', search: '?foo', hash: '#ar', state: { foo: 'bar' } } })
    component.find('a').simulate('click')
    expect(component.find('a').prop('href')).toEqual('/hi?foo#ar')
    expect(dispatch.mock.calls.length).toBe(1)
    expect(dispatch.mock.calls[0]).toEqual([push({ pathname: '/hi', search: '?foo', hash: '#ar', state: { foo: 'bar' } })])
  })
  test('calls original onClick', () => {
    const dispatch = jest.fn()
    const onClick = jest.fn()
    const component = renderComponent(Link, {
      __routeInfo: { dispatch },
      to: {
        pathname: '/hi',
        search: '?foo',
        hash: '#ar',
        state: { foo: 'bar' }
      },
      onClick
    })
    component.find('a').simulate('click', { target: 'hi' })
    expect(component.find('a').prop('href')).toEqual('/hi?foo#ar')
    expect(dispatch.mock.calls.length).toBe(1)
    expect(dispatch.mock.calls[0]).toEqual([push({ pathname: '/hi', search: '?foo', hash: '#ar', state: { foo: 'bar' } })])
    expect(onClick).toBeCalled()
    expect(onClick).toBeCalledWith(expect.objectContaining({
      target: 'hi'
    }))
  })
  test('renders children', () => {
    const dispatch = jest.fn()
    const Far = () => <Link to="/hi" dispatch={() => null}><div>foo</div></Link> // eslint-disable-line
    const component = renderComponent(Far, { dispatch, replace: '/hi' })
    expect(component.text()).toEqual('foo')
  })
  test('dispatches actions when initialized', () => {
  })
  describe('errors', () => {
    let c
    beforeEach(() => {
      c = console.error
      console.error = () => null
    })
    afterEach(() => {
      console.error = c
    })
    test('errors (in dev) on href passed in', () => {
      expect(() => renderComponent(ConnectLink, { __routeInfo: { dispatch: () => null }, href: '/hi' }, {}, true))
        .toThrow('href should not be passed to Link, use "to," "replace" or "route" (passed "/hi")')
    })
  })
  describe('generates the correct path when route option is used', () => {
    test('push', () => {
      const dispatch = jest.fn()
      const component = renderComponent(Link, {
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
      expect(component.find('a').prop('href')).toEqual('/hi/baby')
      component.find('a').simulate('click')
      expect(dispatch.mock.calls.length).toBe(1)
      expect(dispatch.mock.calls[0]).toEqual([push('/hi/baby')])
    })
    test('replace', () => {
      const dispatch = jest.fn()
      const component = renderComponent(Link, {
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
      expect(component.find('a').prop('href')).toEqual('/hi/baby')
      component.find('a').simulate('click')
      expect(dispatch.mock.calls.length).toBe(1)
      expect(dispatch.mock.calls[0]).toEqual([replace('/hi/baby')])
    })
    test('replaces route when props change', () => {
      const component = renderComponent(Link, {
        route: 'hi',
        there: 'baby',
        replace: true,
        __routeInfo: {
          dispatch: () => null,
          routes: {
            hi: {
              name: 'hi',
              path: '/hi/:there'
            },
            there: {
              name: 'there',
              path: '/there/:there'
            }
          }
        },
      })
      expect(component.find('a').prop('href')).toEqual('/hi/baby')
      component.setProps({
        route: 'there',
        there: 'baby',
        replace: true,
        __routeInfo: {
          dispatch: () => null,
          routes: {
            hi: {
              name: 'hi',
              path: '/hi/:there'
            },
            there: {
              name: 'there',
              path: '/there/:there'
            }
          }
        },
      })
      component.update()
      expect(component.find('a').prop('href')).toEqual('/there/baby')
    })
  })

  test('only valid props are passed to the a tag', () => {
    const component = renderComponent(Link, {
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
    expect(Object.keys(component.find('a').props())).toEqual([
      'href', 'onClick', 'download', 'hrefLang', 'referrerPolicy', 'rel', 'target', 'type',
      'id', 'accessKey', 'className', 'contentEditable', 'contextMenu', 'dir', 'draggable',
      'hidden', 'itemID', 'itemProp', 'itemRef', 'itemScope', 'itemType', 'lang',
      'spellCheck', 'style', 'tabIndex', 'title',
      'data-hi', 'children'
    ])
  })})