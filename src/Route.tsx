import React, {
  Children,
  Component,
  useState,
  useContext,
  useEffect,
} from 'react'
import PropTypes from 'prop-types'
import Context, { RouterContext } from './Context'
import { DeclareRoute } from './enhancers'
import { FullStateWithRouter } from './selectors'

export function fake() {
  return {}
}

export interface Props<
  ReduxState extends FullStateWithRouter,
  Params extends { [key: string]: string },
  ParamsState extends { [P in keyof Params]: any },
  Action extends { type: string; [key: string]: any }
> {
  name: string
  path: string
  paramsFromState?: DeclareRoute<
    ReduxState,
    Params,
    ParamsState,
    Action
  >['paramsFromState']
  stateFromParams?: DeclareRoute<
    ReduxState,
    Params,
    ParamsState,
    Action
  >['stateFromParams']
  updateState?: DeclareRoute<
    ReduxState,
    Params,
    ParamsState,
    Action
  >['updateState']
  parentUrl?: string
  parent?: string
  children?: React.ReactElement
}

const defaultProps = {
  paramsFromState: fake,
  stateFromParams: fake,
  updateState: {},
}

function Route<
  ReduxState extends FullStateWithRouter,
  Params extends { [key: string]: string },
  ParamsState extends { [P in keyof Params]: any },
  Action extends { type: string; [key: string]: any }
>(props: Props<ReduxState, Params, ParamsState, Action>) {
  const info = useContext(Context)
  const { parent, parentUrl, children, ...params } = props
  const [url, setUrl] = useState(parentUrl)
  useEffect(() => {
    if (parent && info && info.routes && info.routes[parent]) {
      setUrl(info.routes[parent].path)
    }
  }, [])
  const slash = url && url[url.length - 1] === '/' ? '' : '/'

  const path = url ? `${url}${slash}${params.path}` : params.path
  info &&
    info.addRoute<ReduxState, Params, ParamsState, Action>({
      ...defaultProps,
      ...params,
      parent: parent as string,
      path,
    } as DeclareRoute<ReduxState, Params, ParamsState, Action>)
  setUrl(path)

  return (
    <div style={{ display: 'none' }}>
      {children &&
        Children.map(children, child =>
          React.cloneElement(child, {
            parentUrl: url,
          })
        )}
    </div>
  )
}

export default Route
