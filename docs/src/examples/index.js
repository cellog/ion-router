import BasicSource from '!!prismjs?lang=jsx!./Basic.jsx' // eslint-disable-line
import Basic, { reducer } from './Basic'
import LoadingSource from '!!prismjs?lang=jsx!./Loading.jsx' // eslint-disable-line
import Loading, { reducer as loadingReducer } from './Loading'
import SubRoutesSource from '!!prismjs?lang=jsx!./SubRoutes.jsx' // eslint-disable-line
import SubRoutes, { reducer as subroutesReducer } from './SubRoutes'
import StateChangesSource from '!!prismjs?lang=jsx!./StateChanges.jsx' // eslint-disable-line
import StateChanges, { reducer as statechangesReducer } from './StateChanges'

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
