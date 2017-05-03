import BasicSource from '!!prismjs?lang=jsx!./Basic.jsx' // eslint-disable-line
import Basic, { reducer } from './Basic'
import LoadingSource from '!!prismjs?lang=jsx!./Loading.jsx' // eslint-disable-line
import Loading, { reducer as loadingReducer } from './Loading'

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
  }
}
