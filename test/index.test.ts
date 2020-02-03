import makeRouter, * as index from '../src'
import * as actions from '../src/actions'
import * as enhancers from '../src/enhancers'
import { Store } from 'redux'
import { IonRouterOptions } from '../src'

describe('ion-router', () => {
  test('synchronousMakeRoutes', () => {
    const routes = [
      {
        name: 'campers',
        path: '/campers/:year(/:id)',
        paramsFromState: state => ({
          id: state.campers.selectedCamper
            ? state.campers.selectedCamper
            : undefined,
          year: state.currentYear + '', // eslint-disable-line
        }),
        stateFromParams: params => ({
          id: params.id ? params.id : false,
          year: +params.year,
        }),
        updateState: {
          id: id => ({ type: 'select', payload: id }),
          year: year => ({ type: 'year', payload: year }),
        },
      },
      {
        name: 'ensembles',
        path: '/ensembles(/:id)',
        paramsFromState: state => ({
          id: state.ensembleTypes.selectedEnsembleType
            ? state.ensembleTypes.selectedEnsembleType
            : undefined,
        }),
        stateFromParams: params => ({
          id: params.id ? params.id : false,
        }),
        updateState: {
          id: id => ({ type: 'ensemble', payload: id }),
        },
      },
      {
        name: 'foo',
        path: '/my/:fancy/path(/:wow/*supercomplicated(/:thing))',
      },
    ]
    const opts = {
      isServer: false,
      enhancedRoutes: {},
    }
    expect(index.synchronousMakeRoutes(routes, opts)).toEqual(
      actions.batchRoutes(routes)
    )
    expect(opts.enhancedRoutes).toEqual({
      campers: {
        ...enhancers.enhanceRoute(routes[0]),
        parent: undefined,
      },
      ensembles: {
        ...enhancers.enhanceRoute(routes[1]),
        parent: undefined,
      },
      foo: {
        ...enhancers.enhanceRoute(routes[2]),
        parent: undefined,
      },
    })
  })
  describe('main', () => {
    test('sets options server', () => {
      const store = ({
        routerOptions: {
          isServer: false,
          enhancedRoutes: {},
        },
      } as unknown) as Store & IonRouterOptions
      index.default(() => () => null, store, undefined, true)
      expect(store.routerOptions.isServer).toBe(true)
    })
    test('sets up server routes', () => {
      const log = []
      const store = ({
        getState: () => ({
          routing: { location: { pathname: 'hi', search: '', hash: '' } },
        }),
        dispatch: action => log.push(action),
        routerOptions: {
          enhancedRoutes: {},
        },
      } as unknown) as Store & IonRouterOptions
      const routes = [
        {
          name: 'hi',
          path: '/hi',
        },
        {
          name: 'there',
          path: '/there',
        },
      ]
      makeRouter(() => () => null, store, routes, true)
      expect(log).toEqual([
        actions.batchRoutes(routes),
        actions.route({ pathname: 'hi', search: '', hash: '' }),
      ])
      expect(store.routerOptions).toEqual({
        enhancedRoutes: {
          hi: {
            ...enhancers.enhanceRoute({
              name: 'hi',
              path: '/hi',
              parent: undefined,
            }),
          },
          there: {
            ...enhancers.enhanceRoute({
              name: 'there',
              path: '/there',
              parent: undefined,
            }),
          },
        },
        isServer: true,
      })
    })
  })
})
