import raw from 'raw.macro'
import Basic, { reducer } from './Basic'
import Loading, { reducer as loadingReducer } from './Loading'
import SubRoutes, { reducer as subroutesReducer } from './SubRoutes'
import StateChanges, { reducer as statechangesReducer } from './StateChanges'

const BasicSource = raw('./Basic.jsx')
const LoadingSource = raw('./Loading.jsx')
const SubRoutesSource = raw('./SubRoutes.jsx')
const StateChangesSource = raw('./StateChanges.jsx')

export default {
  basic: {
    source: BasicSource,
    component: Basic,
    reducer,
    name: 'Basic Example'
  },
  loading: {
    source: LoadingSource,
    component: Loading,
    reducer: loadingReducer,
    name: 'Loading Component'
  },
  subroutes: {
    source: SubRoutesSource,
    component: SubRoutes,
    reducer: subroutesReducer,
    name: 'Dynamic Sub-routes'
  },
  statechanges: {
    source: StateChangesSource,
    component: StateChanges,
    reducer: statechangesReducer,
    name: 'Redux State Changes URL'
  }
}
