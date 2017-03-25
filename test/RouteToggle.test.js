import React from 'react'
import { connectToggle } from '../src/Toggle'

import RouteToggle from '../src/RouteToggle'
import { renderComponent, connect } from './test_helper'

describe('RouteToggle', () => {
  const Component = props => ( // eslint-disable-next-line
    <div>
      hi {Object.keys(props).map(prop => <div key={prop} className={prop}>{props[prop]}</div>)}
    </div>
  )
  let Route, state // eslint-disable-line
  describe('initialized', () => {
    beforeEach(() => {
      connectToggle(connect)
      Route = RouteToggle('test')
    })
    it('renders the component if the route matches', () => {
      const container = renderComponent(Route, { component: Component, foo: 'bar' }, {
        week: 1,
        routing: {
          routes: {
            test: {
              name: 'test',
              path: '/test'
            }
          },
          matchedRoutes: ['test']
        }
      })
      expect(container.find(Component)).has.length(1)
      expect(container.find('.foo')).has.length(1)
      expect(container.find('.foo').text()).eqls('bar')
    })
    it('does not render the component if the route matches', () => {
      const container = renderComponent(Route, { component: Component, foo: 'bar' }, {
        week: 1,
        routing: {
          routes: {
            test: {
              name: 'test',
              path: '/test'
            }
          },
          matchedRoutes: ['no']
        }
      })
      expect(container.find(Component)).has.length(0)
    })
    it('does not render the component if the route matches, but other does not', () => {
      const Route = RouteToggle('test', () => false)

      const container = renderComponent(Route, { component: Component, foo: 'bar' }, {
        week: 1,
        routing: {
          routes: {
            test: {
              name: 'test',
              path: '/test'
            }
          },
          matchedRoutes: ['test']
        }
      })
      expect(container.find(Component)).has.length(0)
    })
    it('does not call state if loaded returns false', () => {
      const spy = sinon.spy(() => true)
      const loaded = sinon.spy(() => false)
      const R = RouteToggle('test', spy, loaded)
      const container = renderComponent(R, { component: Component, foo: 'bar', week: 1 }, {
        week: 1,
        routing: {
          routes: {
            test: {
              name: 'test',
              path: '/test'
            }
          },
          matchedRoutes: ['no']
        }
      })

      expect(spy.called).is.false
      expect(loaded.called).is.true
      expect(container.find(Component)).has.length(0)
    })
    it('componentLoadingMap', () => {
      const R = RouteToggle('test', () => true, () => true, {
        component: 'bobby',
        loadingComponent: 'frenzel',
        else: 'blah'
      })
      const container = renderComponent(R, { component: Component, bobby: 'hi', frenzel: 'there', blah: 'oops' }, {
        week: 1,
        routing: {
          routes: {
            test: {
              name: 'test',
              path: '/test'
            }
          },
          matchedRoutes: ['test']
        }
      })
      expect(container.find(Component)).has.length(1)
      expect(container.find(Component).props('component')).eqls('hi')
      expect(container.find(Component).props('bobby')).eqls(undefined)
      expect(container.find(Component).props('loadingComponent')).eqls('there')
      expect(container.find(Component).props('frenzel')).eqls(undefined)
      expect(container.find(Component).props('else')).eqls('oops')
      expect(container.find(Component).props('blah')).eqls(undefined)
    })
  })
})