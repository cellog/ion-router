import { expectType, expectError, expectAssignable } from 'tsd'

import {
  addRoute,
  FullStateWithRouter,
  EditRouteAction,
  batchRoutes,
  BatchAddRoutesAction,
  batchRemoveRoutes,
  BatchRemoveRoutesAction,
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

// route with exitParams 1
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
    exitParams: {
      there: 'hoo',
    },
  })
)

// route with exitParams 2
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
    exitParams: ({ there, arr }) => {
      return { there: 'hoo' }
    },
  })
)

// batch routes
expectType<BatchAddRoutesAction>(
  batchRoutes([
    {
      name: 'hi1',
      path: '/hi/:there',
      parent: '',
    },
    {
      name: 'hi2',
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
      exitParams: ({ there, arr }) => {
        return { there: 'hoo' }
      },
    },
  ])
)

// batch routes
expectType<BatchRemoveRoutesAction>(
  batchRemoveRoutes([
    {
      name: 'hi1',
      path: '/hi/:there',
      parent: '',
    },
    {
      name: 'hi2',
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
      exitParams: ({ there, arr }) => {
        return { there: 'hoo' }
      },
    },
  ])
)

//**********************************ERRORS**************************************/

// wrong type for params (must be all string)
expectError(
  addRoute({
    name: 'hi',
    path: '/hi/:there/:arr',
    parent: '',
    stateFromParams: ({ there, arr }: { there: string; arr: number }) => {
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

// wrong type for intermediate state (must be a keyed object, keyed by string)
expectError(
  addRoute({
    name: 'hi',
    path: '/hi/:there/:arr',
    parent: '',
    stateFromParams: ({ there, arr }: { there: string; arr: string }) => {
      return 1
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

// wrong type for redux state
expectError(
  addRoute({
    name: 'hi',
    path: '/hi/:there/:arr',
    parent: '',
    stateFromParams: ({ there, arr }: { there: string; arr: string }) => {
      return { thing: [there, arr] }
    },
    paramsFromState: (state: 5) => {
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

// wrong keys for params
expectError(
  addRoute({
    name: 'hi',
    path: '/hi/:there/:arr',
    parent: '',
    stateFromParams: ({ there, arr }: { there: string; arr: string }) => {
      return { thing: [there, arr] }
    },
    paramsFromState: state => {
      return {
        wrong: state.routing.location.pathname,
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

// wrong keys for updateState
expectError(
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
      wrong: (thing): { type: 'fronk'; thing: string[] } => ({
        type: 'fronk',
        thing,
      }),
    },
  })
)

// doesn't return an action
expectError(
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
      there: thing => 1,
    },
  })
)
