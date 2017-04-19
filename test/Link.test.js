import React from 'react'

import ConnectLink, { Link, connectLink } from '../src/Link'
import { push, replace } from '../src/actions'
import { setEnhancedRoutes } from '../src'
import * as enhancers from '../src/enhancers'
import { renderComponent, connect } from './test_helper'

describe('Link', () => {
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
      renderComponent(ConnectLink, { dispatch: () => null, to: '/hi' }, {}, true)
    }).throws('call connectLink with the connect function from react-redux to ' +
      'initialize Link (see https://github.com/cellog/ion-router/issues/1)')
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

    expect(spy1.args[0][0]({
      routing: {
        routes: {}
      }
    })).eqls({ '@@__routes': {} })
    expect(spy.args[0]).eqls([Link])
  })
  it('dispatches actions when initialized', () => {
    const spy = sinon.spy()
    connectLink(connect)
    const [component, , log] = renderComponent(ConnectLink, { dispatch: () => null, to: '/hi', onClick: spy }, {}, true)
    component.find('a').trigger('click')
    expect(log).eqls([push('/hi')])
    expect(spy.called).is.true
  })
  it('errors (in dev) on href passed in', () => {
    connectLink(connect)
    expect(() => renderComponent(ConnectLink, { dispatch: () => null, href: '/hi' }, {}, true))
      .throws('href should not be passed to Link, use "to," "replace" or "route" (passed "/hi")')
  })
  describe('generates the correct path when route option is used', () => {
    before(() => {
      setEnhancedRoutes(enhancers.save({
        name: 'there',
        path: '/there/:there'
      }, enhancers.save({
        name: 'hi',
        path: '/hi/:there'
      }, {})))
    })
    it('push', () => {
      const dispatch = sinon.spy()
      const component = renderComponent(Link, {
        route: 'hi',
        there: 'baby',
        dispatch,
        '@@__routes': {
          hi: {
            name: 'hi',
            path: '/hi/:there'
          }
        }
      })
      expect(component.find('a').props('href')).eqls('/hi/baby')
      component.find('a').trigger('click')
      expect(dispatch.called).is.true
      expect(dispatch.args[0]).eqls([push('/hi/baby')])
    })
    it('replace', () => {
      const dispatch = sinon.spy()
      const component = renderComponent(Link, {
        route: 'hi',
        there: 'baby',
        replace: true,
        dispatch,
        '@@__routes': {
          hi: {
            name: 'hi',
            path: '/hi/:there'
          }
        }
      })
      expect(component.find('a').props('href')).eqls('/hi/baby')
      component.find('a').trigger('click')
      expect(dispatch.called).is.true
      expect(dispatch.args[0]).eqls([replace('/hi/baby')])
    })
    it('replaces route when props change', () => {
      const component = renderComponent(Link, {
        route: 'hi',
        there: 'baby',
        replace: true,
        dispatch: () => null,
        '@@__routes': {
          hi: {
            name: 'hi',
            path: '/hi/:there'
          },
          there: {
            name: 'there',
            path: '/there/:there'
          }
        }
      })
      expect(component.find('a').props('href')).eqls('/hi/baby')
      component.props({
        route: 'there',
        there: 'baby',
        replace: true,
        dispatch: () => null,
        '@@__routes': {
          hi: {
            name: 'hi',
            path: '/hi/:there'
          },
          there: {
            name: 'there',
            path: '/there/:there'
          }
        }
      })
      expect(component.find('a').props('href')).eqls('/there/baby')
    })
  })
  it('only valid props are passed to the a tag', () => {
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
    expect(Object.keys(component.find('a').props())).eqls([
      'href', 'onClick', 'download', 'hrefLang', 'referrerPolicy', 'rel', 'target', 'type',
      'id', 'accessKey', 'className', 'contentEditable', 'contextMenu', 'dir', 'draggable',
      'hidden', 'itemID', 'itemProp', 'itemRef', 'itemScope', 'itemType', 'lang',
      'spellCheck', 'style', 'tabIndex', 'title',
      'data-hi', 'children'
    ])
  })
})
