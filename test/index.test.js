import { take, fork, call, cancel, select, put } from 'redux-saga/effects'
import { createMockTask } from 'redux-saga/utils'
import createHistory from 'history/createMemoryHistory'
import createBrowserHistory from 'history/createBrowserHistory'
import historyChannel from '../src/historyChannel'
import doRoutes, {
  getRoutes,
  makePath,
  matchesPath,
  makeRoute,
  clearRoutes,

  browserActions,
  listenForRoutes,
  router,
  initRoute,
} from '../src'
import { connectLink } from '../src/Link'
import { connectRoutes } from '../src/Routes'
import { connectToggle } from '../src/Toggle'
import * as types from '../src/types'
import * as actions from '../src/actions'
import * as selectors from '../src/selectors'

describe('react-redux-saga-router', () => {
  afterEach(() => clearRoutes())
  describe('makePath/matchesPath', () => {
    beforeEach(() => {
      const history = createHistory({
        initialEntries: ['/']
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
      }, {
        name: 'foo',
        path: '/my/:fancy/path(/:wow/*supercomplicated(/:thing))',
      }]
      makeRoute(history, routes[0])
      makeRoute(history, routes[1])
      makeRoute(history, routes[2])
    })
    it('makePath', () => {
      expect(makePath('oops')).eqls(false)
      expect(makePath('campers', { year: '2014', id: 'hi' })).eqls('/campers/2014/hi')
      expect(makePath('campers', { })).eqls(false)
      expect(makePath('ensembles', { id: 'hi' })).eqls('/ensembles/hi')
      expect(makePath('ensembles', { })).eqls('/ensembles')
      expect(makePath('foo', { fancy: 'shmancy' })).eqls('/my/shmancy/path')
      expect(makePath('foo', { fancy: 'shmancy', wow: 'amazing', supercomplicated: 'boop/deboop' }))
        .eqls('/my/shmancy/path/amazing/boop/deboop')
      expect(makePath('foo', { fancy: 'shmancy', wow: 'amazing', supercomplicated: 'boop/deboop', thing: 'huzzah' }))
        .eqls('/my/shmancy/path/amazing/boop/deboop/huzzah')
    })
    it('matchesPath', () => {
      expect(matchesPath('oops')).eqls(false)
      expect(matchesPath('campers', '/campers/2014/hi')).eqls({ year: '2014', id: 'hi' })
      expect(matchesPath('campers', '/campefrs/2014')).eqls(false)
      expect(matchesPath('campers', { pathname: '/campers/2014/hi', search: '', hash: '' })).eqls({ year: '2014', id: 'hi' })
    })
  })
  it('browserActions', () => {
    const fake = { push: () => null }
    const saga = browserActions(fake)
    let next = saga.next()

    expect(next.value).eqls(take(types.ACTION))
    next = saga.next(actions.push('/hi'))

    expect(next.value).eqls(call([fake, fake.push], '/hi', undefined))
    next = saga.next()

    expect(next.value).eqls(take(types.ACTION))
    next = saga.next(actions.push('/hi', { some: 'state' }))

    expect(next.value).eqls(call([fake, fake.push], '/hi', { some: 'state' }))
    next = saga.next()

    expect(next.value).eqls(take(types.ACTION))
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
    const mockTask = createMockTask()
    const channel = historyChannel(history)
    const connect = () => null
    const saga = router(connect, routes, history, channel)
    let next = saga.next()

    expect(next.value).eqls(fork(listenForRoutes, history))
    next = saga.next()

    expect(next.value).eqls(call(connectLink, connect))
    next = saga.next()

    expect(next.value).eqls(call(connectRoutes, connect))
    next = saga.next()

    expect(next.value).eqls(call(connectToggle, connect))
    next = saga.next()

    expect(next.value).eqls(put(actions.route(history.location)))
    next = saga.next()

    expect(next.value).eqls(fork(browserActions, history))
    next = saga.next(mockTask)

    makeRoute(history, routes[0])
    makeRoute(history, routes[1])

    expect(next.value).eqls(call(initRoute, history, routes[0]))
    next = saga.next()

    expect(next.value).eqls(call(initRoute, history, routes[1]))
    next = saga.next()

    expect(next.value).eqls(take(channel))
    next = saga.next({
      location: {
        pathname: '/campers/2017',
        search: '',
        hash: ''
      }
    })

    expect(next.value).eqls(put(actions.pending()))
    next = saga.next()

    expect(next.value).eqls(put(actions.route({
      pathname: '/campers/2017',
      search: '',
      hash: ''
    })))
    next = saga.next()

    expect(next.value).eqls(put(actions.matchRoutes(['campers'])))
    next = saga.next()

    expect(next.value).eqls(put(actions.exitRoutes(['ensembles'])))
    next = saga.next()

    expect(next.value).eqls(put(actions.enterRoutes(['campers'])))
    next = saga.next()

    const generatedRoutes = getRoutes()
    expect(next.value).eqls([
      call([
        generatedRoutes.ensembles, generatedRoutes.ensembles.exitRoute
      ], '/ensembles')
    ])
    next = saga.next()

    expect(next.value).eqls([
      call([
        generatedRoutes.campers, generatedRoutes.campers.monitorUrl
      ], {
        pathname: '/campers/2017',
        search: '',
        hash: ''
      }),
      call([
        generatedRoutes.ensembles, generatedRoutes.ensembles.monitorUrl
      ], {
        pathname: '/campers/2017',
        search: '',
        hash: ''
      })
    ])
    next = saga.next()

    expect(next.value).eqls(put(actions.commit()))
    next = saga.next()

    expect(next.value).eqls(take(channel))
    next = saga.next({
      location: {
        pathname: '/campers/2016',
        search: '',
        hash: ''
      }
    })

    expect(next.value).eqls(put(actions.pending()))
    next = saga.next()

    expect(next.value).eqls(put(actions.route({
      pathname: '/campers/2016',
      search: '',
      hash: ''
    })))
    next = saga.next()

    expect(next.value).eqls(put(actions.matchRoutes(['campers'])))
    next = saga.next()

    expect(next.value).eqls([
      call([
        generatedRoutes.campers, generatedRoutes.campers.monitorUrl
      ], {
        pathname: '/campers/2016',
        search: '',
        hash: ''
      }),
      call([
        generatedRoutes.ensembles, generatedRoutes.ensembles.monitorUrl
      ], {
        pathname: '/campers/2016',
        search: '',
        hash: ''
      })
    ])
    next = saga.next()

    expect(next.value).eqls(put(actions.commit()))
    next = saga.next()

    expect(next.value).eqls(take(channel))

    next = saga.throw(new Error('all done'))
    expect(next.value).eqls(cancel(mockTask))

    try {
      next = saga.next()
    } catch (e) { // eslint-disable-line

    }
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
    doRoutes(middleware, connect, routes, a, b)
    expect(middleware.run.called).is.true
    expect(middleware.run.args[0]).eqls([router, connect, routes, a, b])
    doRoutes(middleware, connect, routes) // for coverage
  })
  it('listenForRoutes', () => {
    const params = {
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
    }
    const saga = listenForRoutes('hi')
    let next = saga.next()

    expect(next.value).eqls(take(types.CREATE_ROUTE))
    next = saga.next(actions.createRoute(params))

    expect(next.value).eqls(fork(initRoute, 'hi', params))
  })
  it('initRoute', () => {
    const history = createHistory({
      initialEntries: ['/ensembles']
    })
    const saga = initRoute(history, routes[0])
    let next = saga.next()

    expect(next.value).eqls(put(actions.addRoute('campers', '/campers/:year(/:id)')))
    next = saga.next()

    const generatedRoutes = getRoutes()
    expect(next.value).eqls(call([generatedRoutes.campers, generatedRoutes.campers.initState]))
    next = saga.next()

    expect(next).eqls({ value: undefined, done: true })
  })
  it('initRoute, route exists', () => {
    const history = createHistory({
      initialEntries: ['/ensembles']
    })
    makeRoute(history, routes[0])
    const groutes = getRoutes()

    const saga = initRoute(history, routes[0])
    const next = saga.next()

    expect(next.value).eqls(call([groutes.campers, groutes.campers.unload]))
  })
  it('initRoute, route matches url', () => {
    const history = createHistory({
      initialEntries: ['/campers/2017']
    })
    const saga = initRoute(history, routes[0])
    let next = saga.next()

    expect(next.value).eqls(put(actions.addRoute('campers', '/campers/:year(/:id)')))
    next = saga.next()

    const generatedRoutes = getRoutes()
    expect(next.value).eqls(call([generatedRoutes.campers, generatedRoutes.campers.initState]))
    next = saga.next()

    expect(next.value).eqls(select(selectors.matchedRoutes))
    next = saga.next([])

    expect(next.value).eqls(put(actions.matchRoutes(['campers'])))
    next = saga.next()

    expect(next).eqls({ value: undefined, done: true })
  })
})
