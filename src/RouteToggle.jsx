import Toggle from './Toggle'
import * as selectors from './selectors'

export default function RouteToggle(route, othertests = null, loading = undefined,
  componentMap = {}, debug = false, storeKey = 'store') {
  return Toggle(state => (selectors.matchedRoute(state, route) &&
      (othertests ? othertests(state) : true)
  ), loading, componentMap, debug, storeKey)
}
