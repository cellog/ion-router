import React from 'react'
import Route, { fake } from '../src/Route'
import Routes, { connectRoutes } from '../src/Routes'
import * as actions from '../src/actions'
import * as enhancers from '../src/enhancers'
import { renderComponent, connect, sagaStore } from './test_helper'

describe('Route', () => {
  const paramsFromState = state => ({
    id: state.ensembleTypes.selectedEnsembleType ?
      (state.ensembleTypes.selectedEnsembleType === true ? 'new' : state.ensembleTypes.selectedEnsembleType) :
      undefined,
  })
  const stateFromParams = params => ({
    id: params.id ?
      (params.id === 'new' ? true : params.id) :
      false,
  })
  const updateState = {
    id: (id) => {
      const ret = [actions.selectEnsembleType(id)]
      if (id === true) {
        ret.unshift(actions.newTempEnsembleType())
      }
      return ret
    }
  }
  let component, store, log // eslint-disable-line
  connectRoutes(connect)
  function make(props = {}, Comp = Routes, state = {}, s = undefined) {
    const info = renderComponent(Comp, props, state, true, s)
    component = info[0]
    store = info[1]
    log = info[2]
  }
  it('immediately dispatches a route creation action', () => {
    // eslint-disable-next-line
    const R = () => (<Routes>
      <Route
        name="ensembles"
        path="/ensembles/:id"
        paramsFromState={paramsFromState}
        stateFromParams={stateFromParams}
        updateState={updateState}
      />
    </Routes>)
    make({}, R)
    expect(log).eqls([
      actions.route({ pathname: '/',
        search: '',
        hash: '',
        state: undefined,
        key: undefined }),
      actions.batchRoutes([{
        name: 'ensembles',
        path: '/ensembles/:id',
        paramsFromState,
        stateFromParams,
        parent: undefined,
        updateState
      }])
    ])
  })
  it('uses parent', () => {
    const R = () => <Routes>
      <Route name="test" parent="foo" path="mine/" />
    </Routes>
    const mystore = sagaStore({
      routing: {
        matchedRoutes: [],
        location: {
          pathname: '',
          hash: '',
          search: ''
        },
        routes: {
          ids: ['foo'],
          routes: {
            foo: {
              name: 'foo',
              path: '/testing/'
            }
          }
        }
      }
    })
    mystore.store.routerOptions.enhancedRoutes = enhancers.save({
      name: 'foo',
      path: '/testing/'
    }, {})
    make({}, R, undefined, mystore)
    expect(log).eqls([
      actions.route({ pathname: '/',
        search: '',
        hash: '',
        state: undefined,
        key: undefined
      }),
      actions.batchRoutes([{ name: 'test',
        path: '/testing/mine/',
        parent: 'foo',
        paramsFromState: fake,
        stateFromParams: fake,
        updateState: {}
      }])
    ])
  })
  it('passes url down to children', () => {
    fake() // for coverage
    const R = () => <Routes>
      <Route
        name="ensembles"
        path="/ensembles/:id"
        paramsFromState={paramsFromState}
        stateFromParams={stateFromParams}
        updateState={updateState}
      >
        <Route
          name="test"
          path="hi/"
        >
          <Route
            name="gronk"
            path="fi"
          />
        </Route>
      </Route>
    </Routes>
    make({}, R)
    expect(log).eqls([
      actions.route({ pathname: '/',
        search: '',
        hash: '',
        state: undefined,
        key: undefined
      }),
      actions.batchRoutes([{
        name: 'ensembles',
        path: '/ensembles/:id',
        paramsFromState,
        stateFromParams,
        updateState
      }, {
        name: 'test',
        path: '/ensembles/:id/hi/',
        paramsFromState: fake,
        stateFromParams: fake,
        updateState: {}
      }, {
        name: 'gronk',
        path: '/ensembles/:id/hi/fi',
        paramsFromState: fake,
        stateFromParams: fake,
        updateState: {}
      }])
    ])
  })
})
