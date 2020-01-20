import { expectType, expectError, expectAssignable } from 'tsd'

import {
  addRoute,
  FullStateWithRouter,
  EditRouteAction,
  DeclareRoute,
} from '..'

// simple route
expectType<
  EditRouteAction<
    FullStateWithRouter,
    { [key: string]: string },
    { [key: string]: any },
    { [key: string]: any; type: string }
  >
>(
  addRoute({
    name: 'hi',
    path: '/hi/:there',
    parent: '',
  })
)

// route with stateFromParams
expectType<
  EditRouteAction<
    FullStateWithRouter,
    { there: string; arr: string },
    { thing: string[] },
    { type: 'fronk'; thing: string[] }
  >
>(
  addRoute({
    name: 'hi',
    path: '/hi/:there/:arr',
    parent: '',
    stateFromParams: ({ there, arr }: { there: string; arr: string }) => {
      return { thing: [there, arr] }
    },
    paramsFromState: state => {
      return {
        there: state.routing.location.pathname,
        arr: state.routing.location.hash,
      }
    },
    updateState: {
      thing: (thing): { type: 'fronk'; thing: string[] } => ({
        type: 'fronk',
        thing,
      }),
    },
  })
)
