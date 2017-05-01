import BasicSource from '!!prismjs?lang=jsx!./Basic.jsx' // eslint-disable-line
import Basic, { reducer } from './Basic'

export default {
  basic: {
    source: BasicSource,
    component: Basic,
    reducer
  }
}
