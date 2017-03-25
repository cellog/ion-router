import * as selectors from '../src/selectors'

describe('react-redux-saga-router selectors', () => {
  it('matchedRoute', () => {
    const state = {
      routing: {
        matchedRoutes: [
          'foo', 'gronk'
        ]
      }
    }
    expect(selectors.matchedRoute(state, 'foo')).eqls(true)
    expect(selectors.matchedRoute(state, 'bar')).eqls(false)
    expect(selectors.matchedRoute(state, ['foo'])).eqls(true)
    expect(selectors.matchedRoute(state, ['foo', 'bar'])).eqls(true)
    expect(selectors.matchedRoute(state, ['foo', 'bar'], true)).eqls(false)
    expect(selectors.matchedRoute(state, ['bar'])).eqls(false)
    expect(selectors.matchedRoute(state, ['foo', 'gronk'])).eqls(true)
    expect(selectors.matchedRoute(state, ['foo', 'gronk'], true)).eqls(true)
  })
  const mystate = {
    routing: {
      routes: {
        ids: ['foo'],
        routes: {
          foo: {
            name: 'foo',
            state: {
              hi: 'hi'
            },
            params: {
              hi: 'there'
            }
          }
        }
      }
    }
  }
  it('oldState', () => {
    expect(selectors.oldState(mystate, 'foo')).eqls({
      hi: 'hi'
    })
  })
  it('oldState', () => {
    expect(selectors.oldParams(mystate, 'foo')).eqls({
      hi: 'there'
    })
  })
  it('stateExists', () => {
    expect(selectors.stateExists({}, { hi: false })).eqls(false)
    expect(selectors.stateExists({ hi: 'there' }, { hi: '' })).eqls(true)
    expect(selectors.stateExists({
      hi: {
        subthing: 'there'
      }
    }, {
      hi: {
        subthing: ''
      }
    })).eqls(true)
    expect(selectors.stateExists({
      hi: {
        subthing: {
        }
      }
    }, {
      hi: {
        subthing: {
          another: false
        }
      }
    })).eqls(false)
    expect(selectors.stateExists({
      hi: {
        ids: [],
        things: {},
        selectedThing: 'whatever'
      }
    }, {
      hi: {
        ids: [],
        things: {},
      }
    })).eqls(true)
    expect(selectors.stateExists({
      hi: {
        ids: [],
        things: {},
        selectedThing: 'whatever'
      }
    }, {
      hi: {
        ids: [],
        things: {},
        selectedThing: false
      }
    })).eqls(false)
    expect(selectors.stateExists({
      hi: {
        ids: [],
        things: {},
        selectedThing: 'whatever'
      }
    }, {
      hi: {
        ids: [],
        things: {},
        selectedThing: (thing, state) =>
          state.hi.ids.indexOf(thing) !== -1 && state.hi.things[thing]
      }
    })).eqls(false)
    expect(selectors.stateExists({
      hi: {
        ids: ['whatever'],
        sin: null,
        things: {
          whatever: {}
        },
        selectedThing: 'whatever'
      }
    }, {
      hi: {
        ids: [],
        sin: null,
        things: {},
        selectedThing: (thing, state) =>
          state.hi.ids.indexOf(thing) !== -1 && !!state.hi.things[thing]
      }
    })).eqls(true)
    expect(selectors.stateExists({
      hi: {
        ids: false,
        sin: null
      }
    }, {
      hi: {
        ids: [],
        sin: null
      }
    })).eqls(false)
    expect(selectors.stateExists({}, {
      rep: {
        composers: {
          ids: [],
          composers: {},
          selectedComposer: false
        },
        pieces: {
          ids: [],
          pieces: {},
          selectedPiece: false
        }
      }
    })).eqls(false)
  })
  it('matchedRoutes', () => {
    expect(selectors.matchedRoutes({
      routing: {
        matchedRoutes: ['hi']
      }
    })).eqls(['hi'])
  })
  it('location', () => {
    expect(selectors.location({
      routing: {
        location: {
          pathname: 'hi',
          search: '',
          hash: ''
        }
      }
    })).eqls({
      pathname: 'hi',
      search: '',
      hash: ''
    })
  })
  it('noMatches', () => {
    expect(selectors.noMatches({
      routing: {
        matchedRoutes: []
      }
    })).eqls(true)
    expect(selectors.noMatches({
      routing: {
        matchedRoutes: ['hi']
      }
    })).eqls(false)
  })
})
