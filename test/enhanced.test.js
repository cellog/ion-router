import RouteParser from 'route-parser'
import * as enhance from '../src/enhancers'

describe('enhanced route store', () => {
  it('fake', () => {
    expect(enhance.fake('hi')).eqls({})
  })
  it('save', () => {
    expect(enhance.save({
      name: 'thing',
      path: '/another'
    }, {})).eqls({
      thing: {
        ...enhance.enhanceRoute({
          name: 'thing',
          path: '/another'
        })
      }
    })
  })
  it('enhanceRoute', () => {
    expect(enhance.enhanceRoute({
      name: 'thing',
      path: '/another'
    })).eqls({
      stateFromParams: enhance.fake,
      paramsFromState: enhance.fake,
      updateState: {},
      exitParams: {},
      name: 'thing',
      path: '/another',
      '@parser': new RouteParser('/another'),
      state: {},
      params: {}
    })
    expect(enhance.enhanceRoute({
      name: 'thing',
      path: '/:another'
    })).eqls({
      stateFromParams: enhance.fake,
      paramsFromState: enhance.fake,
      updateState: {},
      exitParams: undefined,
      name: 'thing',
      path: '/:another',
      '@parser': new RouteParser('/:another'),
      state: {},
      params: {}
    })
  })
})
