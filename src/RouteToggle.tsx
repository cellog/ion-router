import Toggle, {
  ReduxSelector,
  ComponentLoadingMap,
  MightDefineVars,
  LoadedSelector,
} from './Toggle'
import * as selectors from './selectors'

export function RouteToggle<ExtraProps extends MightDefineVars>(
  route: string,
  othertests: ReduxSelector | null = null,
  loading: LoadedSelector | undefined = undefined,
  componentMap: ComponentLoadingMap<ExtraProps> = {}
) {
  return Toggle(
    (state: selectors.FullStateWithRouter) =>
      selectors.matchedRoute(state, route) &&
      (othertests ? othertests(state) : true),
    loading,
    componentMap
  )
}

export default RouteToggle
