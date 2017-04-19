import * as index from '../src'
import reducer from '../src/reducer'
import * as actions from '../src/actions'
import * as enhancers from '../src/enhancers'

describe('ion-router', () => {
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

  it('synchronousMakeRoutes', () => {
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
    const opts = {}
    expect(index.synchronousMakeRoutes(routes, opts)).eqls(actions.batchRoutes(routes))
    expect(opts.enhancedRoutes).eqls({
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
      }
    })
    index.synchronousMakeRoutes([])
  })
  it('setServer', () => {
    expect(index.options.server).is.false
    index.setServer()
    expect(index.options.server).is.true
    index.setServer(false)
    expect(index.options.server).is.false
  })
  describe('routingReducer', () => {
    it('setup', () => {
      const spy = sinon.spy()
      const fakeReducer = (state, action) => {
        spy(state, action)
        return state
      }
      const metareducer = index.routingReducer(fakeReducer)
      expect(metareducer()).eqls({
        routing: reducer()
      })
      expect(spy.called).is.true
      expect(spy.args[0]).eqls([undefined, undefined])
    })
    it('sets routing if not present', () => {
      const spy = sinon.spy()
      const fakeReducer = (state = { hi: 'there' }, action) => {
        spy(state, action)
        return state
      }
      const metareducer = index.routingReducer(fakeReducer)
      expect(metareducer({ hi: 'there' })).eqls({
        routing: reducer(),
        hi: 'there'
      })
      expect(spy.called).is.true
      expect(spy.args[0]).eqls([{
        routing: reducer(),
        hi: 'there'
      }, undefined])
    })
    it('works even with no reducer', () => {
      expect(index.routingReducer()()).eqls({
        routing: reducer()
      })
    })
    it('normal flow', () => {
      const state = index.routingReducer()()
      console.log(state)
      expect(index.routingReducer()(state, { type: 'hi' })).eqls(state)
    })
  })
  describe('main', () => {
    it('returns a createStore clone', () => {
      expect(index.default()).is.instanceof(Function)
    })
    it('calls the 3 connect functions', () => {
      const spy = sinon.spy()
      const createStore = index.default(() => spy)
      createStore()
      expect(spy.called).is.true
      expect(spy.args).has.length(2)
    })
    it('sets options server', () => {
      const createStore = index.default(() => () => null, undefined, undefined, true)
      createStore()
      expect(index.options.isServer).is.true
    })
    it('sets up server routes', () => {
      const createStore = index.default(() => () => null, [
        {
          name: 'hi',
          path: '/hi'
        },
        {
          name: 'there',
          path: '/there'
        }
      ])
      createStore()
      expect(index.options.enhancedRoutes).eqls(enhancers.save(
        {
          name: 'there',
          path: '/there',
          parent: undefined,
        }, enhancers.save(
          {
            name: 'hi',
            path: '/hi',
            parent: undefined,
          }, {}
      )))
    })
  })
})
