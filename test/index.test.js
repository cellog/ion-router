import { fork, call, put } from 'redux-saga/effects'
import createHistory from 'history/createMemoryHistory'
import createBrowserHistory from 'history/createBrowserHistory'
import historyChannel from '../src/historyChannel'

import * as index from '../src'
import { connectLink } from '../src/Link'
import { connectRoutes } from '../src/Routes'
import { connectToggle } from '../src/Toggle'
import * as actions from '../src/actions'
import * as enhancers from '../src/enhancers'
import * as sagas from '../src/sagas'

describe('react-redux-saga-router', () => {
  afterEach(() => index.setEnhancedRoutes({}))
  describe('makePath/matchesPath', () => {
    beforeEach(() => {
      const routes = [{
        name: 'campers',
        path: '/campers/:year(/:id)',
        paramsFromState: state => ({
          id: state.campers.selectedCamper ? state.campers.selectedCamper : undefined,
          year: state.currentYear + '' // eslint-disable-line
        }),
        stateFromParams: params => ({
          id: params.id ? params.id : false,
          year: +params.year
        }),
        updateState: {
          id: id => ({ type: 'select', payload: id }),
          year: year => ({ type: 'year', payload: year })
        }
      }, {
        name: 'ensembles',
        path: '/ensembles(/:id)',
        paramsFromState: state => ({
          id: state.ensembleTypes.selectedEnsembleType ?
            state.ensembleTypes.selectedEnsembleType : undefined,
        }),
        stateFromParams: params => ({
          id: params.id ? params.id : false,
        }),
        updateState: {
          id: id => ({ type: 'ensemble', payload: id }),
        }
      }, {
        name: 'foo',
        path: '/my/:fancy/path(/:wow/*supercomplicated(/:thing))',
      }]
      index.setEnhancedRoutes(
        enhancers.save(routes[2],
        enhancers.save(routes[1],
        enhancers.save(routes[0], {}))))
    })
    it('makePath', () => {
      expect(index.makePath('oops')).eqls(false)
      expect(index.makePath('campers', { year: '2014', id: 'hi' })).eqls('/campers/2014/hi')
      expect(index.makePath('campers', { })).eqls(false)
      expect(index.makePath('ensembles', { id: 'hi' })).eqls('/ensembles/hi')
      expect(index.makePath('ensembles', { })).eqls('/ensembles')
      expect(index.makePath('foo', { fancy: 'shmancy' })).eqls('/my/shmancy/path')
      expect(index.makePath('foo', { fancy: 'shmancy', wow: 'amazing', supercomplicated: 'boop/deboop' }))
        .eqls('/my/shmancy/path/amazing/boop/deboop')
      expect(index.makePath('foo', { fancy: 'shmancy', wow: 'amazing', supercomplicated: 'boop/deboop', thing: 'huzzah' }))
        .eqls('/my/shmancy/path/amazing/boop/deboop/huzzah')
    })
    it('matchesPath', () => {
      expect(index.matchesPath('oops')).eqls(false)
      expect(index.matchesPath('campers', '/campers/2014/hi')).eqls({ year: '2014', id: 'hi' })
      expect(index.matchesPath('campers', '/campefrs/2014')).eqls(false)
      expect(index.matchesPath('campers', { pathname: '/campers/2014/hi', search: '', hash: '' })).eqls({ year: '2014', id: 'hi' })
    })
  })
  it('begin/commit', (done) => {
    const options = {
      pending: false
    }
    expect(index.pending(options)).eqls(false)
    const pending = index.begin(options)
    expect(pending).eqls(true)
    expect(index.pending(options)).equals(options.pending)
    options.pending.then((value) => {
      expect(value).eqls(false)
      done()
    })
    index.commit(options)
  })
  const routes = [{
    name: 'campers',
    path: '/campers/:year(/:id)',
    paramsFromState: state => ({
      id: state.campers.selectedCamper ? state.campers.selectedCamper : undefined,
      year: state.currentYear + '' // eslint-disable-line
    }),
    stateFromParams: params => ({
      id: params.id ? params.id : false,
      year: +params.year
    }),
    updateState: {
      id: id => ({ type: 'select', payload: id }),
      year: year => ({ type: 'year', payload: year })
    }
  }, {
    name: 'ensembles',
    path: '/ensembles(/:id)',
    paramsFromState: state => ({
      id: state.ensembleTypes.selectedEnsembleType ?
        state.ensembleTypes.selectedEnsembleType : undefined,
    }),
    stateFromParams: params => ({
      id: params.id ? params.id : false,
    }),
    updateState: {
      id: id => ({ type: 'ensemble', payload: id }),
    }
  }]
  it('router', () => {
    const history = createHistory({
      initialEntries: ['/ensembles']
    })
    const channel = historyChannel(history)
    const connect = () => null
    const saga = index.router(connect, routes, history, channel, false)
    let next = saga.next()

    expect(next.value).eqls([
      call(connectLink, connect),
      call(connectRoutes, connect),
      call(connectToggle, connect),

      fork(sagas.routeMonitor, index.options, history),

      fork(sagas.stateMonitor, index.options),
      fork(sagas.browserListener, history),
      fork(sagas.locationListener, channel, index.options),
    ])
    next = saga.next()

    expect(next.value).eqls(put(actions.batchRoutes(routes)))
    next = saga.next()

    expect(next.value).eqls(put(actions.route(history.location)))
    next = saga.next()

    expect(next).eqls({ value: undefined, done: true })
  })
  it('main', () => {
    const middleware = {
      run: sinon.spy()
    }
    const a = createBrowserHistory()
    const b = historyChannel(a)
    const routes = [{
      name: 'campers',
      path: '/campers/:year(/:id)',
      paramsFromState: state => ({
        id: state.campers.selectedCamper ? state.campers.selectedCamper : undefined,
        year: state.currentYear + '' // eslint-disable-line
      }),
      stateFromParams: params => ({
        id: params.id ? params.id : false,
        year: +params.year
      }),
      updateState: {
        id: id => ({ type: 'select', payload: id }),
        year: year => ({ type: 'year', payload: year })
      }
    }]
    const connect = () => null
    index.default(middleware, connect, routes, a, true, b)
    expect(middleware.run.called).is.true
    expect(middleware.run.args[0]).eqls([index.router, connect, routes, a, b, true])
    index.default(middleware, connect, routes) // for coverage
  })
})
