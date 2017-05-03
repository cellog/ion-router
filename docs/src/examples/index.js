import BasicSource from '!!prismjs?lang=jsx!./Basic.jsx' // eslint-disable-line
import Basic, { reducer } from './Basic'
import LoadingSource from '!!prismjs?lang=jsx!./Loading.jsx' // eslint-disable-line
import Loading, { reducer as loadingReducer } from './Loading'
import SubRoutesSource from '!!prismjs?lang=jsx!./SubRoutes.jsx' // eslint-disable-line
import SubRoutes, { reducer as subroutesReducer } from './SubRoutes'

export default {
  basic: {
    source: BasicSource,
    component: Basic,
    reducer
  },
  loading: {
    source: LoadingSource,
    component: Loading,
    reducer: loadingReducer
  },
  subroutes: {
    source: SubRoutesSource,
    component: SubRoutes,
    reducer: subroutesReducer
  }
}
