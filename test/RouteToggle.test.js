import React from 'react'

import RouteToggle from '../src/RouteToggle'
import { renderComponent } from './test_helper'
import * as rtl from '@testing-library/react'

describe('RouteToggle', () => {
  afterEach(() => rtl.cleanup())
  const Component = props => ( // eslint-disable-next-line
    <div>
      hi {Object.keys(props).map(prop => <div key={prop} data-testid={prop}>{props[prop]}</div>)}
    </div>
  )
  let Route, state // eslint-disable-line
  describe('initialized', () => {
    beforeEach(() => {
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
      expect(container.getByTestId('foo')).toHaveTextContent('bar')
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
      expect(container.queryByTestId('foo')).toBe(null)
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
        expect(container.queryByTestId('foo')).toBe(null)
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
      expect(loaded.mock.calls.length).toBe(2)
      expect(container.queryByTestId('foo')).toBe(null)
    })
    test('componentLoadingMap', () => {
      const R = RouteToggle('test', () => true, () => true, {
        component: 'bobby',
        loadingComponent: 'frenzel',
        else: 'blah'
      })
      const Show = (props) => (
        <ul>
          {Object.keys(props).map(prop => <li key={prop} data-testid={prop}>{JSON.stringify(props[prop])}</li>)}
        </ul>
      )
      const container = renderComponent(R, { component: Show, bobby: 'hi', frenzel: 'there', blah: 'oops' }, {
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
      expect(container.getByTestId('component')).toHaveTextContent('"hi"')
      expect(container.getByTestId('bobby')).toHaveTextContent('')
      expect(container.getByTestId('loadingComponent')).toHaveTextContent('"there"')
      expect(container.getByTestId('frenzel')).toHaveTextContent('')
      expect(container.getByTestId('else')).toHaveTextContent('"oops"')
      expect(container.getByTestId('blah')).toHaveTextContent('')
    })
  })
})
