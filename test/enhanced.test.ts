import RouteParser from 'route-parser'
import * as enhance from '../src/enhancers'

describe('enhanced route store', () => {
  test('fake', () => {
    // coverage
    expect(enhance.fake()).toEqual({})
  })
  test('save', () => {
    expect(
      enhance.save(
        {
          name: 'thing',
          path: '/another',
        },
        {}
      )
    ).toEqual({
      thing: {
        ...enhance.enhanceRoute({
          name: 'thing',
          path: '/another',
        }),
      },
    })
  })
  test('enhanceRoute', () => {
    expect(
      enhance.enhanceRoute({
        name: 'thing',
        path: '/another',
      })
    ).toEqual({
      stateFromParams: enhance.fake,
      paramsFromState: enhance.fake,
      updateState: {},
      exitParams: {},
      name: 'thing',
      path: '/another',
      '@parser': new RouteParser('/another'),
      state: {},
      params: {},
    })
    expect(
      enhance.enhanceRoute({
        name: 'thing',
        path: '/:another',
      })
    ).toEqual({
      stateFromParams: enhance.fake,
      paramsFromState: enhance.fake,
      updateState: {},
      exitParams: undefined,
      name: 'thing',
      path: '/:another',
      '@parser': new RouteParser('/:another'),
      state: {},
      params: {},
    })
  })
})
