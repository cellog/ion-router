import RouteParser from 'route-parser'

export const fake = thing => ({}) // eslint-disable-line

export function enhanceRoute(params) {
  const parser = new RouteParser(params.path)
  const reversed = parser.reverse()
  return {
    stateFromParams: fake,
    paramsFromState: fake,
    updateState: {},
    state: {},
    params: {},
    exitParams: reversed ? parser.match(reversed) : undefined,
    ...params,
    '@parser': parser,
  }
}

export function save(params, enhancements) {
  return {
    ...enhancements,
    [params.name]: enhanceRoute(params)
  }
}
