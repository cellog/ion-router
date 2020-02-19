import Toggle, {
  ReduxSelector,
  ComponentLoadingMap,
  MightDefineVars,
  LoadedSelector,
} from './Toggle'
import * as selectors from './selectors'

export function RouteToggle<
  ExtraProps extends MightDefineVars,
  StoreState extends selectors.FullStateWithRouter
>(
  route: string,
  othertests: ReduxSelector<StoreState> | null = null,
  loading: LoadedSelector<StoreState> | undefined = undefined,
  componentMap: ComponentLoadingMap<ExtraProps> = {}
) {
  return Toggle(
    (state: StoreState) =>
      selectors.matchedRoute(state, route) &&
      (othertests ? othertests(state) : true),
    loading,
    componentMap
  )
}

export default RouteToggle
