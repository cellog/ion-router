import createHistory from 'history/createMemoryHistory'

import createMiddleware, {
  actionHandlers,
  ignoreKey,
  ActionHandlers,
} from '../src/middleware'
import storeEnhancer, { IonRouterOptions } from '../src/storeEnhancer'
import { synchronousMakeRoutes, FullStateWithRouter } from '../src'
import routerReducer from '../src/reducer'
import * as actions from '../src/actions'
import * as types from '../src/types'
import * as enhancers from '../src/enhancers'
import { sagaStore } from './test_helper'
import { History } from 'history'
import { Store, Action } from 'redux'
import RouteParser from 'route-parser'

describe('middleware', () => {
  test('subscribes to history', () => {
    const spy: History = {
      length: 0,
      listen: jest.fn(),
      location: {
        pathname: 'hi',
        search: '',
        hash: '',
        state: {},
      },
      push: jest.fn(),
      replace: jest.fn(),
      go: jest.fn(),
      goBack: jest.fn(),
      action: 'PUSH',
      goForward: jest.fn(),
      block: jest.fn(),
      createHref: jest.fn(),
    }
    const store: Store & IonRouterOptions = {
      dispatch: jest.fn(),
      routerOptions: {
        isServer: false,
        enhancedRoutes: {},
        pending: false,
        resolve: false,
      },
      getState: jest.fn(),
      subscribe: jest.fn(),
      replaceReducer: jest.fn(),
      [Symbol.observable]: jest.fn(),
    }
    const mid = createMiddleware(spy)
    expect(mid(store)).toBeInstanceOf(Function)
    expect(store.dispatch).toBeCalled()
    expect(store.dispatch).toBeCalledWith(
      actions.route({
        pathname: 'hi',
        search: '',
        hash: '',
        state: {},
      })
    )
    expect(spy.listen).toBeCalled()
    expect((spy.listen as any).mock.calls[0][0]).toBeInstanceOf(Function)
    ;(spy.listen as any).mock.calls[0][0]({
      pathname: 'foo',
      search: '',
      hash: '',
    })
    expect((store.dispatch as any).mock.calls[1]).toEqual([
      actions.route({
        pathname: 'foo',
        search: '',
        hash: '',
      }),
    ])
    store.dispatch = jest.fn()
    ;(spy.listen as any).mock.calls[0][0]({
      pathname: 'foo',
      search: '',
      hash: '',
    })
    expect((store.dispatch as any).mock.calls.length).toBe(0)
  })
  let history: History
  let opts: IonRouterOptions['routerOptions']
  function makeEnhancedStore(
    spies = actionHandlers,
    reducers = undefined,
    debug = false
  ) {
    return sagaStore(
      undefined,
      reducers,
      [],
      storeEnhancer(history, spies, debug, opts)
    )
  }
  test('throws on action with false route', () => {
    expect(() => {
      const { store } = makeEnhancedStore()
      store.dispatch(actions.push((false as unknown) as string))
    }).toThrow('ion-router action push must be a string or a location object')
  })
  test('does not throw on goBack or goForward', () => {
    expect(() => {
      const { store } = makeEnhancedStore()
      store.dispatch(actions.goBack())
    }).not.toThrowError()
    expect(() => {
      const { store } = makeEnhancedStore()
      store.dispatch(actions.goForward())
    }).not.toThrowError()
  })
  describe('normal functionality tests', () => {
    beforeEach(() => {
      history = createHistory({
        initialEntries: ['/'],
      })
      opts = {
        isServer: false,
        enhancedRoutes: {},
      }
    })
    test('calls ignore when receiving an action in process', () => {
      const spy = jest.fn()
      const spies: ActionHandlers = {
        ...actionHandlers,
        '*': enhancedRoutes => ({
          newEnhancedRoutes: enhancedRoutes,
          toDispatch: [{ type: 'foo' }],
        }),
        [ignoreKey]: <
          S extends FullStateWithRouter,
          A extends Action<any>,
          T extends any
        >(
          store: Store<S, A>,
          next: (action: A) => T,
          action: A
        ) => {
          spy(store, next, action)
          return next(action)
        },
      }
      const info = makeEnhancedStore(spies)
      info.store.dispatch({ type: 'ignore me' })
      expect(spy).toBeCalled()
      expect(info.log).toEqual([
        actions.route({
          pathname: '/',
          search: '',
          hash: '',
          key: undefined,
          state: undefined,
        }),
        { type: 'ignore me' },
        { type: 'foo' },
      ])
      createMiddleware() // coverage of default options
    })
    test('calls console.info when debug is true', () => {
      const orig = console.info // eslint-disable-line
      try {
        console.info = jest.fn() // eslint-disable-line
        const spy = jest.fn()
        const spies: ActionHandlers = {
          ...actionHandlers,
          '*': enhancedRoutes => ({
            newEnhancedRoutes: enhancedRoutes,
            toDispatch: [{ type: 'foo' }],
          }),
          [ignoreKey]: <
            S extends FullStateWithRouter,
            A extends Action<any>,
            T extends any
          >(
            store: Store<S, A>,
            next: (action: A) => T,
            action: A
          ) => {
            spy(store, next, action)
            return next(action)
          },
        }
        const info = makeEnhancedStore(spies, undefined, true)
        info.store.dispatch({ type: 'ignore me' })
        /* eslint-disable no-console */
        expect(console.info).toHaveBeenCalled()
        expect((console.info as any).mock.calls[0]).toEqual([
          'ion-router PROCESSING: ignore me',
        ])
        expect((console.info as any).mock.calls[1]).toEqual([
          'dispatching: ',
          [{ type: 'foo' }],
        ])
      } finally {
        console.info = orig
        /* eslint-enable no-console */
      }
    })
    test('calls an action handler', () => {
      const spy = jest.fn()
      const spies: ActionHandlers = {
        ...actionHandlers,
        '@@ion-router/ACTION': (enhancedRoutes, state, action) => {
          spy(enhancedRoutes, state, action)
          return {
            newEnhancedRoutes: enhancedRoutes,
            toDispatch: [],
          }
        },
      }
      const info = makeEnhancedStore(spies)
      const action = actions.goBack()
      info.store.dispatch(action)
      expect(spy).toBeCalled()
      expect(spy.mock.calls[0][0]).toBe(opts.enhancedRoutes)
      expect(spy.mock.calls[0][1]).toBe(info.store.getState())
      expect(spy.mock.calls[0][2]).toBe(action)
    })
    test('ignores actions triggered in toDispatch', () => {
      const spy = jest.fn()
      const spies = {
        ...actionHandlers,
        hithere: (enhancedRoutes, state, action) => {
          spy(enhancedRoutes, state, action)
          return {
            newEnhancedRoutes: enhancedRoutes,
            toDispatch: [{ type: 'hithere' }],
          }
        },
      }
      const info = makeEnhancedStore(spies, {
        routing: routerReducer,
        bar: (_state = '', action) => (action.type === 'hithere' ? 'wow' : ''),
      })
      const oldState = info.store.getState()
      const action = { type: 'hithere' }
      info.store.dispatch(action)
      expect(spy).toBeCalled()
      expect(spy.mock.calls[0][0]).toBe(opts.enhancedRoutes)
      // shows we pass old state
      expect(spy.mock.calls[0][1]).toBe(oldState)
      expect(spy.mock.calls[0][2]).toBe(action)
      expect(spy.mock.calls.length).toEqual(1)
      expect(info.log).toEqual([
        actions.route({
          pathname: '/',
          search: '',
          hash: '',
          state: undefined,
        }),
        { type: 'hithere' },
        { type: 'hithere' },
      ])
    })
    test('triggers * for unknown actions', () => {
      const spy = jest.fn()
      const spies: ActionHandlers = {
        ...actionHandlers,
        '*': (enhancedRoutes, state, action) => {
          spy(enhancedRoutes, state, action)
          return {
            newEnhancedRoutes: enhancedRoutes,
            toDispatch: [],
          }
        },
      }

      const info = makeEnhancedStore(spies, {
        routing: routerReducer,
        bar: (state = '', action) => (action.type === 'hithere' ? 'wow' : ''), // eslint-disable-line
      })
      const action = { type: 'hithere' }
      info.store.dispatch(action)
      expect(spy).toBeCalled()
      expect(spy.mock.calls[0][0]).toBe(opts.enhancedRoutes)
      // next line shows we pass the new state and not old state
      expect(spy.mock.calls[0][1]).toEqual({
        routing: {
          ...routerReducer(undefined, undefined),
          location: history.location,
        },
        bar: 'wow',
      })
      expect(spy.mock.calls[0][2]).toBe(action)
      expect(info.log).toEqual([
        actions.route({
          pathname: '/',
          search: '',
          hash: '',
          state: undefined,
        }),
        { type: 'hithere' },
      ])
    })
    test('url action handling', () => {
      const duds = {
        ...actionHandlers,
        [types.ROUTE]: newEnhancedRoutes => ({
          newEnhancedRoutes,
          toDispatch: [],
        }),
      }
      const info = makeEnhancedStore(duds)
      info.store.dispatch(actions.push('/foo'))
      expect(info.log).toEqual([
        actions.route({
          pathname: '/',
          search: '',
          hash: '',
          state: undefined,
        }),
        actions.push('/foo'),
        actions.route(info.log[2].payload),
      ])
    })
    test('state action handling passes new state to handler', () => {})
  })
  describe('action handlers', () => {
    test('EDIT_ROUTE', () => {
      const enhanced = {}
      const testenhanced = enhanced
      const state: FullStateWithRouter = {
        routing: {
          ...routerReducer(undefined, undefined),
          location: {
            pathname: '/hi',
            search: '',
            hash: '',
          },
        },
      }
      const teststate = state
      expect(
        actionHandlers[types.EDIT_ROUTE](
          enhanced,
          state,
          actions.addRoute({
            name: 'foo',
            path: '/hi',
          })
        )
      ).toEqual({
        newEnhancedRoutes: enhancers.save(
          actions.addRoute({
            name: 'foo',
            path: '/hi',
          }).payload,
          enhanced
        ),
        toDispatch: [
          actions.matchRoutes(['foo']),
          actions.enterRoutes(['foo']),
        ],
      })
      // verify purity of the function
      expect(enhanced).toBe(testenhanced)
      expect(state).toBe(teststate)
    })
    test('BATCH_ROUTES', () => {
      const enhanced = {}
      const testenhanced = enhanced
      const state: FullStateWithRouter = {
        routing: {
          ...routerReducer(undefined, undefined),
          location: {
            pathname: '/hi',
            hash: '',
            search: '',
          },
        },
      }
      const teststate = state
      const action = actions.batchRoutes([
        {
          name: 'foo',
          path: '/hi',
        },
        {
          name: 'bar',
          path: '/there',
        },
      ])
      expect(
        actionHandlers[types.BATCH_ROUTES](enhanced, state, action)
      ).toEqual({
        newEnhancedRoutes: enhancers.save(
          action.payload.routes.bar,
          enhancers.save(action.payload.routes.foo, enhanced)
        ),
        toDispatch: [
          actions.matchRoutes(['foo']),
          actions.enterRoutes(['foo']),
        ],
      })
      // verify purity of the function
      expect(enhanced).toBe(testenhanced)
      expect(state).toBe(teststate)
    })
    test('REMOVE_ROUTE', () => {
      const enhanced: enhancers.EnhancedRoutes = {
        foo: {
          name: 'foo',
          path: '/hi',
          parent: '',
          params: {},
          state: {},
          stateFromParams: enhancers.fake,
          paramsFromState: enhancers.fake,
          updateState: {},
          '@parser': new RouteParser('/hi'),
        },
      }
      const testenhanced = enhanced
      const state: FullStateWithRouter = {
        routing: {
          ...routerReducer(undefined, undefined),
          location: {
            pathname: '/',
            hash: '',
            search: '',
          },
        },
      }
      const teststate = state
      const action = actions.removeRoute('foo')
      expect(
        actionHandlers[types.REMOVE_ROUTE](enhanced, state, action)
      ).toEqual({
        newEnhancedRoutes: {},
        toDispatch: [],
      })
      // verify purity of the function
      expect(enhanced).toBe(testenhanced)
      expect(state).toBe(teststate)
    })
    test('BATCH_REMOVE_ROUTES', () => {
      const enhanced = {
        foo: {
          name: 'foo',
          path: '/hi',
          parent: '',
          params: {},
          state: {},
          stateFromParams: enhancers.fake,
          paramsFromState: enhancers.fake,
          updateState: {},
          '@parser': new RouteParser('/hi'),
        },
        bar: {
          name: 'bar',
          path: '/there',
          parent: '',
          params: {},
          state: {},
          stateFromParams: enhancers.fake,
          paramsFromState: enhancers.fake,
          updateState: {},
          '@parser': new RouteParser('/there'),
        },
      }
      const testenhanced = enhanced
      const state: FullStateWithRouter = {
        routing: {
          ...routerReducer(undefined, undefined),
          location: {
            pathname: '/',
            hash: '',
            search: '',
          },
        },
      }
      const teststate = state
      const action = actions.batchRemoveRoutes([enhanced.foo, enhanced.bar])
      expect(
        actionHandlers[types.BATCH_REMOVE_ROUTES](enhanced, state, action)
      ).toEqual({
        newEnhancedRoutes: {},
        toDispatch: [],
      })
      // verify purity of the function
      expect(enhanced).toBe(testenhanced)
      expect(state).toBe(teststate)
    })
  })
  describe('routing handlers', () => {
    let enhanced
    let testenhanced
    let state
    let teststate
    beforeEach(() => {
      const opts: IonRouterOptions['routerOptions'] = {
        enhancedRoutes: {},
        isServer: false,
      }
      const action = synchronousMakeRoutes(
        [
          {
            name: 'foo',
            path: '/foo(/:param)',
            paramsFromState: state => ({ param: state.boo.param }),
            stateFromParams: params => params,
            updateState: {
              param: param => ({ type: 'setParam', payload: param }),
            },
          },
          {
            name: 'bar',
            path: '/bar(/:hi)',
            paramsFromState: state => ({ hi: state.bar.hi }),
            stateFromParams: params => params,
            updateState: {
              hi: hi => ({ type: 'setHi', payload: hi }),
            },
          },
        ],
        opts
      )
      enhanced = opts.enhancedRoutes
      enhanced.bar.params = { hi: 'wow' }
      enhanced.bar.state = { hi: 'wow' }
      testenhanced = enhanced
      const info = routerReducer(undefined, action)
      state = {
        routing: {
          ...info,
          location: {
            pathname: '/bar/wow',
            search: '',
            hash: '',
          },
          matchedRoutes: ['bar'],
          routes: {
            ...info.routes,
            routes: {
              ...info.routes.routes,
              bar: {
                ...info.routes.routes.bar,
                params: {
                  hi: 'wow',
                },
                state: {
                  hi: 'wow',
                },
              },
            },
          },
        },
        boo: {
          param: undefined,
        },
        bar: {
          hi: 'wow',
        },
      }
      teststate = state
    })
    test('ROUTE', () => {
      const action = actions.route({
        pathname: '/foo/hi',
        search: '',
        hash: '',
      })
      expect(actionHandlers[types.ROUTE](enhanced, state, action)).toEqual({
        newEnhancedRoutes: {
          ...enhanced,
          bar: {
            ...enhanced.bar,
            params: { hi: undefined },
            state: { hi: undefined },
          },
          foo: {
            ...enhanced.foo,
            params: { param: 'hi' },
            state: { param: 'hi' },
          },
        },
        toDispatch: [
          actions.matchRoutes(['foo']),
          actions.exitRoutes(['bar']),
          actions.enterRoutes(['foo']),
          actions.setParamsAndState('foo', { param: 'hi' }, { param: 'hi' }),
          { type: 'setParam', payload: 'hi' },
          actions.setParamsAndState(
            'bar',
            { hi: undefined },
            { hi: undefined }
          ),
          { type: 'setHi', payload: undefined },
        ],
      })
      // verify purity of the function
      expect(enhanced).toBe(testenhanced)
      expect(state).toBe(teststate)
    })
    test('ACTION', () => {
      const action = actions.push('/foo')
      expect(actionHandlers[types.ACTION](enhanced, state, action)).toEqual({
        newEnhancedRoutes: enhanced,
        toDispatch: [],
      })
    })
    test('*', () => {
      expect(
        actionHandlers['*'](
          enhanced,
          {
            ...state,
            bar: {
              hi: 'bye',
            },
          },
          { type: 'whatever' }
        )
      ).toEqual({
        newEnhancedRoutes: {
          ...enhanced,
          bar: {
            ...enhanced.bar,
            params: { hi: 'bye' },
            state: { hi: 'bye' },
          },
        },
        toDispatch: [
          actions.setParamsAndState('bar', { hi: 'bye' }, { hi: 'bye' }),
          actions.push('/bar/bye'),
        ],
      })
      // verify purity of the function
      expect(enhanced).toBe(testenhanced)
      expect(state).toBe(teststate)
    })
  })
})
