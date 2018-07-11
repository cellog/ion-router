import * as selectors from '../src/selectors'

describe('selectors', () => {
  test('matchedRoute', () => {
    const state = {
      routing: {
        matchedRoutes: [
          'foo', 'gronk'
        ]
      }
    }
    expect(selectors.matchedRoute(state, 'foo')).toEqual(true)
    expect(selectors.matchedRoute(state, 'bar')).toEqual(false)
    expect(selectors.matchedRoute(state, ['foo'])).toEqual(true)
    expect(selectors.matchedRoute(state, ['foo', 'bar'])).toEqual(true)
    expect(selectors.matchedRoute(state, ['foo', 'bar'], true)).toEqual(false)
    expect(selectors.matchedRoute(state, ['bar'])).toEqual(false)
    expect(selectors.matchedRoute(state, ['foo', 'gronk'])).toEqual(true)
    expect(selectors.matchedRoute(state, ['foo', 'gronk'], true)).toEqual(true)
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
  test('oldState', () => {
    expect(selectors.oldState(mystate, 'foo')).toEqual({
      hi: 'hi'
    })
  })
  test('oldState', () => {
    expect(selectors.oldParams(mystate, 'foo')).toEqual({
      hi: 'there'
    })
  })
  test('stateExists', () => {
    expect(selectors.stateExists({}, { hi: false })).toEqual(false)
    expect(selectors.stateExists({ hi: 'there' }, { hi: '' })).toEqual(true)
    expect(selectors.stateExists({
      hi: {
        subthing: 'there'
      }
    }, {
      hi: {
        subthing: ''
      }
    })).toEqual(true)
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
    })).toEqual(false)
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
    })).toEqual(true)
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
    })).toEqual(false)
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
    })).toEqual(false)
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
    })).toEqual(true)
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
    })).toEqual(false)
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
    })).toEqual(false)
  })
  test('matchedRoutes', () => {
    expect(selectors.matchedRoutes({
      routing: {
        matchedRoutes: ['hi']
      }
    })).toEqual(['hi'])
  })
  test('location', () => {
    expect(selectors.location({
      routing: {
        location: {
          pathname: 'hi',
          search: '',
          hash: ''
        }
      }
    })).toEqual({
      pathname: 'hi',
      search: '',
      hash: ''
    })
  })
  test('noMatches', () => {
    expect(selectors.noMatches({
      routing: {
        matchedRoutes: []
      }
    })).toEqual(true)
    expect(selectors.noMatches({
      routing: {
        matchedRoutes: ['hi']
      }
    })).toEqual(false)
  })
})
