import React from 'react'
import Route, { fakeRouteHelper as fake } from '../src/Route'
import Routes from '../src/Routes'
import * as actions from '../src/actions'
import * as enhancers from '../src/enhancers'
import { renderComponent, sagaStore } from './test_helper'

jest.mock('../src/Context')

describe('Route', () => {
  const paramsFromState = state => ({
    id: state.ensembleTypes.selectedEnsembleType
      ? state.ensembleTypes.selectedEnsembleType === true
        ? 'new'
        : state.ensembleTypes.selectedEnsembleType
      : undefined,
  })
  const stateFromParams = params => ({
    id: params.id ? (params.id === 'new' ? true : params.id) : false,
  })
  const updateState = {
    id: (id: string | true) => {
      const ret: {
        type: 'selectEnsemble' | 'newTempEnsemble'
        id?: string | true
      }[] = [{ type: 'selectEnsemble' as const, id }]
      if (id === true) {
        ret.unshift({ type: 'newTempEnsemble' as const })
      }
      return ret
    },
  }
  let component, store, log // eslint-disable-line
  function make(props = {}, Comp = Routes, state = {}, s = undefined) {
    const info = renderComponent(Comp, props, state, true, s)
    component = info[0]
    store = info[1]
    log = info[2]
  }
  test('immediately dispatches a route creation action', () => {
    store = sagaStore({
      routing: {
        location: {
          hash: '',
          search: '',
          pathname: '/',
        },
        matchedRoutes: [],
        routes: {
          ids: [],
          routes: {},
        },
      },
    })
    const R = () => (
      <Routes store={store.store}>
        <Route
          name="ensembles"
          path="/ensembles/:id"
          paramsFromState={paramsFromState}
          stateFromParams={stateFromParams}
          updateState={updateState}
        />
      </Routes>
    )
    make({}, R, {}, store)
    expect(log).toEqual([
      actions.route({
        pathname: '/',
        search: '',
        hash: '',
        state: undefined,
        key: undefined,
      }),
      actions.batchRoutes([
        {
          name: 'ensembles',
          path: '/ensembles/:id',
          paramsFromState,
          stateFromParams,
          parent: undefined,
          updateState,
        },
      ]),
    ])
  })
  test('uses parent', () => {
    const mystore = sagaStore({
      routing: {
        matchedRoutes: [],
        location: {
          pathname: '',
          hash: '',
          search: '',
        },
        routes: {
          ids: ['foo'],
          routes: {
            foo: {
              name: 'foo',
              path: '/testing/',
            },
          },
        },
      },
    })
    mystore.store.routerOptions.enhancedRoutes = enhancers.save(
      {
        name: 'foo',
        path: '/testing/',
      },
      {}
    )
    const R = () => (
      <Routes store={mystore.store}>
        <Route name="test" parent="foo" path="mine/" />
      </Routes>
    )
    make({}, R, undefined, mystore)
    expect(log).toEqual([
      actions.route({
        pathname: '/',
        search: '',
        hash: '',
        state: undefined,
        key: undefined,
      }),
      actions.batchRoutes([
        {
          name: 'test',
          path: '/testing/mine/',
          parent: 'foo',
          paramsFromState: fake,
          stateFromParams: fake,
          updateState: {},
        },
      ]),
    ])
  })
  test('passes url down to children', () => {
    fake() // for coverage
    store = sagaStore({})
    const R = () => (
      <Routes store={store.store}>
        <Route
          name="ensembles"
          path="/ensembles/:id"
          paramsFromState={paramsFromState}
          stateFromParams={stateFromParams}
          updateState={updateState}
        >
          <Route name="test" path="hi/">
            <Route name="gronk" path="fi" />
          </Route>
        </Route>
      </Routes>
    )
    make({}, R, {}, store)
    expect(log).toEqual([
      actions.route({
        pathname: '/',
        search: '',
        hash: '',
        state: undefined,
        key: undefined,
      }),
      actions.batchRoutes([
        {
          name: 'ensembles',
          path: '/ensembles/:id',
          paramsFromState,
          stateFromParams,
          updateState,
        },
        {
          name: 'test',
          path: '/ensembles/:id/hi/',
          paramsFromState: fake,
          stateFromParams: fake,
          updateState: {},
        },
        {
          name: 'gronk',
          path: '/ensembles/:id/hi/fi',
          paramsFromState: fake,
          stateFromParams: fake,
          updateState: {},
        },
      ]),
    ])
  })
})
