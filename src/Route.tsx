import React, { Children, useContext, useRef } from 'react'
import Context, { RouterContext } from './Context'
import { DeclareRoute } from './enhancers'
import { FullStateWithRouter } from './selectors'

export function fakeRouteHelper() {
  return {}
}

export interface Props<
  ReduxState extends FullStateWithRouter,
  Params extends { [key: string]: string },
  ParamsState extends { [key: string]: any },
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
  paramsFromState: fakeRouteHelper,
  stateFromParams: fakeRouteHelper,
  updateState: {},
}

function Route<
  ReduxState extends FullStateWithRouter,
  Params extends { [key: string]: string },
  ParamsState extends { [key: string]: any },
  Action extends { type: string; [key: string]: any }
>(props: Props<ReduxState, Params, ParamsState, Action>) {
  const info = useContext(Context)
  const added = useRef(false)
  const { parent, parentUrl, children, ...params } = props
  let url = parentUrl
  if (parent && info && info.routes && info.routes[parent]) {
    url = info.routes[parent].path
  }
  const slash = url && url[url.length - 1] === '/' ? '' : '/'
  const path = url ? `${url}${slash}${params.path}` : params.path
  if (!added.current && info) {
    info.addRoute<ReduxState, Params, ParamsState, Action>({
      ...defaultProps,
      ...params,
      parent,
      path,
    } as DeclareRoute<ReduxState, Params, ParamsState, Action>)
    added.current = true
  }

  return (
    <div style={{ display: 'none' }}>
      {children &&
        Children.map(children, child =>
          React.cloneElement(child, {
            parentUrl: path,
          })
        )}
    </div>
  )
}

export default Route
