import raw from 'raw.macro'
import Basic, { reducer } from './Basic'
import Loading, { reducer as loadingReducer } from './Loading'
import SubRoutes, { reducer as subroutesReducer } from './SubRoutes'
import StateChanges, { reducer as statechangesReducer } from './StateChanges'
import Typescript, { reducer as typescriptReducer } from './Typescript'

const BasicSource = raw('./Basic.jsx')
const LoadingSource = raw('./Loading.jsx')
const SubRoutesSource = raw('./SubRoutes.jsx')
const StateChangesSource = raw('./StateChanges.jsx')
const TypescriptSource = raw('./Typescript.tsx')

const examples: {
  [key: string]: {
    source: string
    component: any
    reducer: any
    name: string
    lang: 'jsx' | 'tsx'
  }
} = {
  basic: {
    source: BasicSource,
    component: Basic,
    reducer,
    name: 'Basic Example',
    lang: 'jsx',
  },
  loading: {
    source: LoadingSource,
    component: Loading,
    reducer: loadingReducer,
    name: 'Loading Component',
    lang: 'jsx',
  },
  subroutes: {
    source: SubRoutesSource,
    component: SubRoutes,
    reducer: subroutesReducer,
    name: 'Dynamic Sub-routes',
    lang: 'jsx',
  },
  statechanges: {
    source: StateChangesSource,
    component: StateChanges,
    reducer: statechangesReducer,
    name: 'Redux State Changes URL',
    lang: 'jsx',
  },
  typescript: {
    source: TypescriptSource,
    component: Typescript,
    reducer: typescriptReducer,
    name: 'Typescript example',
    lang: 'tsx',
  },
}

export default examples
