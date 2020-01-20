import React, { Children }  from 'react'

import { Link } from '../src/Link'
import { push, replace } from '../src/actions'
import { renderComponent } from './test_helper'
import * as rtl from '@testing-library/react'
import Context from '../src/Context'

describe('Link', () => {
  const Show = context => (props) => (
    <Context.Provider value={context}>
      <Link {...props}>
        hi
      </Link>
    </Context.Provider>
  )
  test('dispatches replace', () => {
    const dispatch = jest.fn()
    const component = renderComponent(Show({ dispatch }), { replace: '/hi' })
    rtl.fireEvent.click(component.getByText('hi'))
    expect(dispatch).toHaveBeenCalledWith(replace('/hi'))
  })
  test('dispatches push', () => {
    const dispatch = jest.fn()
    const component = renderComponent(Show({ dispatch }), { to: { pathname: '/hi', search: '?foo', hash: '#ar', state: { foo: 'bar' } } })
    rtl.fireEvent.click(component.getByText('hi'))
    expect(dispatch).toHaveBeenCalledWith(push({ pathname: '/hi', search: '?foo', hash: '#ar', state: { foo: 'bar' } }))
  })
  test('calls original onClick', () => {
    const dispatch = jest.fn()
    const onClick = jest.fn()
    const component = renderComponent(Show({ dispatch }), {
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
    expect(onClick).toBeCalled()
  })
  test('renders children', () => {
    const dispatch = jest.fn()
    const Far = () => <Context.Provider value={{ dispatch }}><Link to="/hi" dispatch={() => null}><div>foo</div></Link></Context.Provider>
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
      expect(() => renderComponent(Show({ dispatch: () => {} }), { href: '/hi' }, {}, true))
        .toThrow('href should not be passed to Link, use "to," "replace" or "route" (passed "/hi")')
    })
  })
  describe('generates the correct path when route option is used', () => {
    test('push', () => {
      const dispatch = jest.fn()
      const component = renderComponent(Show({
        dispatch,
        routes: {
          hi: {
            name: 'hi',
            path: '/hi/:there'
          }
        }
      }), {
        route: 'hi',
        there: 'baby',
      })
      rtl.fireEvent.click(component.getByText('hi'))
      expect(dispatch).toBeCalledWith(push('/hi/baby'))
    })
    test('replace', () => {
      const dispatch = jest.fn()
      const component = renderComponent(Show({
        dispatch,
        routes: {
          hi: {
            name: 'hi',
            path: '/hi/:there'
          }
        }
      }), {
        route: 'hi',
        there: 'baby',
        replace: true,
      })
      rtl.fireEvent.click(component.getByText('hi'))
      expect(dispatch).toBeCalledWith(replace('/hi/baby'))
    })
    test('replaces route when props change', () => {
      let dispatch = jest.fn()
      const contextValue = {
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
        }
      }
      const S = Show(contextValue)
      const component = rtl.render(
        <S
          route='hi'
          there='baby'
          replace={true}
        />)
      rtl.fireEvent.click(component.getByText('hi'))
      expect(dispatch).toBeCalledWith(replace('/hi/baby'))
      contextValue.dispatch = jest.fn()
      const S2 = Show({
        ...contextValue
      })
      component.rerender(<S2
        route='there'
        there='baby'
        replace={true}
      />)
      rtl.fireEvent.click(component.getByText('hi'))
      expect(contextValue.dispatch).toBeCalledWith(replace('/there/baby'))
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