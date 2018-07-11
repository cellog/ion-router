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
    test('renders the component if the route matches', () => {
      const container = renderComponent(Route, { component: Component, foo: 'bar' }, {
        week: 1,
        routing: {
          location: {
            pathname: '',
            hash: '',
            search: ''
          },
          routes: {
            test: {
              name: 'test',
              path: '/test'
            }
          },
          matchedRoutes: ['test']
        }
      })
      expect(container.find(Component)).toHaveLength(1)
      expect(container.find('.foo')).toHaveLength(1)
      expect(container.find('.foo').text()).toEqual('bar')
    })
    test('does not render the component if the route matches', () => {
      const container = renderComponent(Route, { component: Component, foo: 'bar' }, {
        week: 1,
        routing: {
          location: {
            pathname: '',
            hash: '',
            search: ''
          },
          routes: {
            test: {
              name: 'test',
              path: '/test'
            }
          },
          matchedRoutes: ['no']
        }
      })
      expect(container.find(Component)).toHaveLength(0)
    })
    test(
      'does not render the component if the route matches, but other does not',
      () => {
        const Route = RouteToggle('test', () => false)

        const container = renderComponent(Route, { component: Component, foo: 'bar' }, {
          week: 1,
          routing: {
            location: {
              pathname: '',
              hash: '',
              search: ''
            },
            routes: {
              test: {
                name: 'test',
                path: '/test'
              }
            },
            matchedRoutes: ['test']
          }
        })
        expect(container.find(Component)).toHaveLength(0)
      }
    )
    test('does not call state if loaded returns false', () => {
      const spy = jest.fn()
      spy.mockReturnValue(true)
      const loaded = jest.fn()
      spy.mockReturnValue(false)
      const R = RouteToggle('test', spy, loaded)
      const container = renderComponent(R, { component: Component, foo: 'bar', week: 1 }, {
        week: 1,
        routing: {
          location: {
            pathname: '',
            hash: '',
            search: ''
          },
          routes: {
            test: {
              name: 'test',
              path: '/test'
            }
          },
          matchedRoutes: ['no']
        }
      })

      expect(spy.mock.calls.length).toBe(0)
      expect(loaded.mock.calls.length).toBe(1)
      expect(container.find(Component)).toHaveLength(0)
    })
    test('componentLoadingMap', () => {
      const R = RouteToggle('test', () => true, () => true, {
        component: 'bobby',
        loadingComponent: 'frenzel',
        else: 'blah'
      })
      const container = renderComponent(R, { component: Component, bobby: 'hi', frenzel: 'there', blah: 'oops' }, {
        week: 1,
        routing: {
          location: {
            pathname: '',
            hash: '',
            search: ''
          },
          routes: {
            test: {
              name: 'test',
              path: '/test'
            }
          },
          matchedRoutes: ['test']
        }
      })
      expect(container.find(Component)).toHaveLength(1)
      expect(container.find(Component).prop('component')).toEqual('hi')
      expect(container.find(Component).prop('bobby')).toEqual(undefined)
      expect(container.find(Component).prop('loadingComponent')).toEqual('there')
      expect(container.find(Component).prop('frenzel')).toEqual(undefined)
      expect(container.find(Component).prop('else')).toEqual('oops')
      expect(container.find(Component).prop('blah')).toEqual(undefined)
    })
  })
})
