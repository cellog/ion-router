import { expectType, expectError } from 'tsd'
import { AnyAction } from 'redux'
import makeRouter, {
  synchronousMakeRoutes,
  FullStateWithRouter,
  IonRouterActions,
  DeclareRoute,
  IonRouterState,
} from '..'

interface MyState {
  foo: 'ok' | ''
}

synchronousMakeRoutes(
  [
    {
      name: 'index' as const,
      path: '/',
      parent: '',
    },
    {
      name: 'two' as const,
      path: '/:second',
      parent: '',
      stateFromParams: ({ second }: { second: string }) => {
        return { second: second === 'ok' ? ('ok' as const) : ('' as const) }
      },
      paramsFromState: ({ foo }) => ({ second: foo }),
      updateState: {
        second: second => ({ type: 'changeFoo', foo: second }),
      },
    },
  ],
  {
    isServer: false,
    enhancedRoutes: {},
  }
)

synchronousMakeRoutes<
  FullStateWithRouter & MyState,
  { type: 'changeFoo'; foo: 'ok' | '' } | IonRouterActions,
  [
    DeclareRoute<FullStateWithRouter, any, any, any>,
    DeclareRoute<
      MyState & { routing: IonRouterState },
      { second: string },
      { second: 'ok' | '' },
      { type: 'changeFoo'; foo: 'ok' | '' } | IonRouterActions
    >
  ]
>(
  [
    {
      name: 'index' as const,
      path: '/',
      parent: '',
    },
    {
      name: 'two' as const,
      path: '/:second',
      parent: '',
      stateFromParams: ({ second }: { second: string }) => {
        return { second: second === 'ok' ? ('ok' as const) : ('' as const) }
      },
      paramsFromState: ({ foo }) => ({ second: foo }),
      updateState: {
        second: second => ({ type: 'changeFoo' as const, foo: second }),
      },
    },
  ],
  {
    isServer: false,
    enhancedRoutes: {},
  }
)
