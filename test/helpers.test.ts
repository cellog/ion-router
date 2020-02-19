import RouteParser from 'route-parser'
import * as actions from '../src/actions'
import * as enhancers from '../src/enhancers'
import * as helpers from '../src/helpers'
import * as index from '../src'
import reducer from '../src/reducer'
import { IonRouterOptions } from '../src'
import { string } from 'prop-types'

describe('helper functions', () => {
  test('filter', () => {
    expect(
      helpers.filter(
        {
          hi: enhancers.enhanceRoute({
            name: 'hi',
            path: '/hi(/:there)',
          }),
        },
        '/hi/boo'
      )('hi')
    ).toEqual({ there: 'boo' })
  })
  test('diff', () => {
    expect(helpers.diff([], [])).toEqual([])
    expect(helpers.diff(['hi'], ['hi'])).toEqual([])
    expect(helpers.diff(['hi'], [])).toEqual(['hi'])
    expect(helpers.diff([], ['hi'])).toEqual([])
  })
  test('template', () => {
    expect(
      helpers.template(
        {
          name: 'a' as const,
          path: 'a',
          params: {
            hi: '5',
          },
          state: {
            hi: 5,
          },
          parent: 'b',
          stateFromParams: params => params,
          updateState: {
            hi: hi => ({ type: 'hi', hi }),
          },
          paramsFromState: s => s.routing.location,
          '@parser': new RouteParser(''),
          exitParams: {},
        },
        undefined
      )
    ).toEqual({})
    expect(
      helpers.template(
        {
          name: 'a' as const,
          path: 'a',
          params: {
            foo: '5',
          },
          state: {
            hi: 5,
          },
          parent: 'b',
          stateFromParams: params => params,
          updateState: {
            hi: hi => ({ type: 'hi', hi }),
          },
          paramsFromState: s => ({ foo: s.routing.location.pathname }),
          '@parser': new RouteParser<{ foo: string }>(':foo'),
          exitParams: p => ({ ...p, hi: 'there' }),
        },
        { foo: 'bar' }
      )
    ).toEqual({
      foo: 'bar',
      hi: 'there',
    })
  })
  test('changed', () => {
    expect(
      helpers.changed(
        {
          hi: 'there',
        },
        {
          hi: 'there',
        }
      )
    ).toEqual([])
    expect(
      helpers.changed(
        {
          hi: 'f',
          boo: 'boo',
        },
        {
          hi: 'there',
        }
      )
    ).toEqual(['hi', 'boo'])
    expect(
      helpers.changed(
        {
          hi: 'f',
        },
        {
          hi: 'there',
          boo: 'boo',
        }
      )
    ).toEqual(['hi', 'boo'])
    expect(
      helpers.changed(
        {
          composer: undefined,
          piece: undefined,
          filter: '',
        },
        {
          composer: undefined,
          piece: undefined,
          filter: '',
        }
      )
    ).toEqual([])
  })
  describe('urlFromState', () => {
    const options: IonRouterOptions['routerOptions'] = {
      isServer: false,
      enhancedRoutes: {},
    }
    const action = index.synchronousMakeRoutes(
      [
        {
          name: 'hi',
          path: '*a/bar/:test',
          paramsFromState: state => ({ a: state.hia, test: state.test }),
          stateFromParams: params => params,
        },
        {
          name: 'there',
          path: '/foo/*b',
        },
        {
          name: 'three',
          path: '/foo/:bar/*a',
          paramsFromState: state => ({ bar: state.bar, a: state.threet }),
          stateFromParams: params => params,
        },
      ],
      options
    )
    const state = {
      routing: {
        ...reducer(undefined, action),
        matchedRoutes: ['hi', 'there', 'three'],
        location: {
          pathname: '/foo/bar/t',
          search: '',
          hash: '',
        },
      },
      hia: 'foo',
      test: 'tenth',
      bar: 'barb',
      threet: 't',
    }
    test('normal', () => {
      expect(helpers.urlFromState(options.enhancedRoutes, state)).toEqual({
        newEnhancedRoutes: {
          ...options.enhancedRoutes,
          hi: {
            ...options.enhancedRoutes.hi,
            params: { a: 'foo', test: 'tenth' },
            state: { a: 'foo', test: 'tenth' },
          },
          three: {
            ...options.enhancedRoutes.three,
            params: { bar: 'barb', a: 't' },
            state: { bar: 'barb', a: 't' },
          },
        },
        toDispatch: [
          actions.setParamsAndState(
            'hi',
            { a: 'foo', test: 'tenth' },
            { a: 'foo', test: 'tenth' }
          ),
          actions.setParamsAndState(
            'three',
            { bar: 'barb', a: 't' },
            { bar: 'barb', a: 't' }
          ),
          actions.push('foo/bar/tenth'),
          actions.matchRoutes(['hi']),
          actions.exitRoutes(['there', 'three']),
        ],
      })
    })
    test('urlFromState, no change to url', () => {
      const newState = {
        ...state,
        routing: {
          ...[
            actions.setParamsAndState(
              'hi',
              { a: 'foo', test: 'tenth' },
              { a: 'foo', test: 'tenth' }
            ),
            actions.setParamsAndState(
              'three',
              { bar: 'barb', a: 't' },
              { bar: 'barb', a: 't' }
            ),
            actions.push('foo/bar/tenth'),
            actions.matchRoutes(['hi']),
            actions.exitRoutes(['there', 'three']),
          ].reduce((a, b) => reducer(a, b), state.routing),
          location: {
            pathname: 'foo/bar/tenth',
            hash: '',
            search: '',
          },
        },
      }
      const opts = {
        ...options,
        enhancedRoutes: {
          ...options.enhancedRoutes,
          hi: {
            ...options.enhancedRoutes.hi,
            params: { a: 'foo', test: 'tenth' },
            state: { a: 'foo', test: 'tenth' },
          },
        },
      }
      expect(helpers.urlFromState(opts.enhancedRoutes, newState)).toEqual({
        newEnhancedRoutes: opts.enhancedRoutes,
        toDispatch: [],
      })
    })
  })
  test('getStateUpdates', () => {
    expect(
      helpers.getStateUpdates(
        {
          state: {
            a: 1,
            b: 2,
            c: 3,
          },
          updateState: {
            a: (a, s) => ({ type: 'a', a, b: s.b }),
            b: b => ({ type: 'b', b }),
          },
          name: 'a' as const,
          path: 'a',
          parent: undefined,
          params: {
            hi: '5',
          },
          '@parser': new RouteParser(''),
          stateFromParams: ({
            a,
            b,
            c,
          }: {
            a: string
            b: string
            c: string
          }) => ({ a: +a, b: +b, c: +c }),
          paramsFromState: s => s.routing.location,
        },
        {
          a: 2,
          b: 2,
          c: 5,
        }
      )
    ).toEqual([{ type: 'a', a: 2, b: 2 }])
  })
  test('exitRoute', () => {
    expect(
      helpers.exitRoute(
        {
          routing: reducer(undefined, undefined),
        },
        {
          a: {
            name: 'a' as const,
            path: 'a',
            params: {
              hi: '5',
            },
            state: {
              hi: 5,
            },
            parent: 'b',
            exitParams: {
              hi: undefined,
            },
            stateFromParams: params => params,
            updateState: {
              hi: hi => ({ type: 'hi', hi }),
            },
            paramsFromState: s => s.routing.location,
            '@parser': new RouteParser(''),
          },
          b: {
            name: 'b' as const,
            path: 'b',
            params: {
              there: '6',
            },
            state: {
              there: 6,
            },
            parent: 'c',
            exitParams: {
              there: undefined,
            },
            stateFromParams: params => params,
            updateState: {
              there: there => ({ type: 'there', there }),
            },
            paramsFromState: s => s.routing.location,
            '@parser': new RouteParser(''),
          },
          c: {
            name: 'c' as const,
            path: 'c',
            parent: undefined,
            params: {
              booboo: '1',
            },
            state: {
              booboo: 1,
            },
            exitParams: {
              booboo: undefined,
            },
            stateFromParams: params => params,
            updateState: {
              booboo: booboo => ({ type: 'booboo', booboo }),
            },
            paramsFromState: s => s.routing.location,
            '@parser': new RouteParser(''),
          },
        },
        'a'
      )
    )
  })
})
