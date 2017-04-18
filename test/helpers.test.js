import * as actions from '../src/actions'
import * as enhancers from '../src/enhancers'
import * as helpers from '../src/helpers'
import * as index from '../src'
import reducer from '../src/reducer'

describe('helper functions', () => {
  it('filter', () => {
    expect(helpers.filter({
      hi: enhancers.enhanceRoute({
        name: 'hi',
        path: '/hi(/:there)'
      })
    }, '/hi/boo')('hi')).eqls({ there: 'boo' })
  })
  it('diff', () => {
    expect(helpers.diff([], [])).eqls([])
    expect(helpers.diff(['hi'], ['hi'])).eqls([])
    expect(helpers.diff(['hi'], [])).eqls(['hi'])
    expect(helpers.diff([], ['hi'])).eqls([])
  })
  it('template', () => {
    expect(helpers.template({
      exitParams: {}
    })).eqls({})
    expect(helpers.template({
      exitParams: p => ({ ...p, hi: 'there' })
    }, { foo: 'bar' })).eqls({
      foo: 'bar',
      hi: 'there'
    })
  })
  it('changed', () => {
    expect(helpers.changed({
      hi: 'there'
    }, {
      hi: 'there'
    })).eqls([])
    expect(helpers.changed({
      hi: 'f',
      boo: 'boo'
    }, {
      hi: 'there',
    })).eqls(['hi', 'boo'])
    expect(helpers.changed({
      hi: 'f',
    }, {
      hi: 'there',
      boo: 'boo'
    })).eqls(['hi', 'boo'])
  })
  it('urlFromState', () => {
    const options = {}
    const action = index.synchronousMakeRoutes([
      {
        name: 'hi',
        path: '*a/bar/:test',
        paramsFromState: state => ({ a: state.hia, test: state.test }),
        stateFromParams: params => params
      },
      {
        name: 'there',
        path: '/foo/*b'
      },
      {
        name: 'three',
        path: '/foo/:bar/*a',
        paramsFromState: state => ({ bar: state.bar, a: state.threet }),
        stateFromParams: params => params
      }
    ], options)
    const state = {
      routing: {
        ...reducer(undefined, action),
        matchedRoutes: ['hi', 'there', 'three'],
        location: {
          pathname: '/foo/bar/t',
          search: '',
          hash: ''
        }
      },
      hia: 'foo',
      test: 'tenth',
      bar: 'barb',
      threet: 't',
    }
    expect(helpers.urlFromState(options.enhancedRoutes, state)).eqls({
      newEnhancedRoutes: {
        ...options.enhancedRoutes,
        hi: {
          ...options.enhancedRoutes.hi,
          params: { a: 'foo', test: 'tenth' },
          state: { a: 'foo', test: 'tenth' }
        },
        three: {
          ...options.enhancedRoutes.three,
          params: { bar: 'barb', a: 't' },
          state: { bar: 'barb', a: 't' },
        }
      },
      toDispatch: [
        actions.setParamsAndState('hi', { a: 'foo', test: 'tenth' }, { a: 'foo', test: 'tenth' }),
        actions.setParamsAndState('there', { }, { }),
        actions.setParamsAndState('three', { bar: 'barb', a: 't' }, { bar: 'barb', a: 't' }),
        actions.push('foo/bar/tenth'),
        actions.matchRoutes(['hi']),
        actions.exitRoutes(['there', 'three'])
      ]
    })
  })
})
