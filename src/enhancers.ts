import RouteParser from 'route-parser'
import { IonRouterRoute } from './actions'
import { FullStateWithRouter } from './selectors'

export interface DeclareRoute<
  ReduxState extends FullStateWithRouter,
  Params extends { [key: string]: string },
  ParamsState extends { [P in keyof Params]: any },
  Action extends { type: string; [key: string]: any }
> {
  name: string
  path: string
  parent: string
  stateFromParams?: (t: Params, s?: FullStateWithRouter) => ParamsState
  paramsFromState?: (t: ReduxState) => Params
  updateState?: MapInBetweenActions<ParamsState, Action>
  exitParams?: ((exitParams: Params) => Partial<Params>) | Partial<Params>
}

export type MapInBetweenActions<ParamsState, Action> = Partial<
  {
    [P in keyof ParamsState]:
      | ((param: ParamsState[P], state: ParamsState) => Action | Action[])
      | undefined
  }
>

export interface EnhancedRoute<
  ReduxState extends FullStateWithRouter,
  Params extends { [key: string]: string },
  ParamsState extends { [P in keyof Params]: any },
  Action extends { type: string; [key: string]: any }
>
  extends DeclareRoute<ReduxState, Params, ParamsState, Action>,
    IonRouterRoute<ParamsState, Params> {
  stateFromParams: (t: Params, s?: FullStateWithRouter) => ParamsState
  paramsFromState: (t: ReduxState) => Params
  updateState: MapInBetweenActions<ParamsState, Action>
  exitParams?: ((exitParams: Params) => Partial<Params>) | Partial<Params>
  '@parser': RouteParser<Params>
}

export type GetUpdateStateReturn<
  E extends EnhancedRoute<FullStateWithRouter, any, any, any>,
  key extends keyof E['updateState']
> = E['updateState'][key] extends (param: any, state: any) => infer R
  ? R
  : false

export const fake = () => ({})

export function enhanceRoute<
  ReduxState extends FullStateWithRouter,
  Params extends { [key: string]: string },
  ParamsState extends { [P in keyof Params]: any },
  Action extends { type: string; [key: string]: any }
>(
  routeParams: DeclareRoute<ReduxState, Params, ParamsState, Action>
): EnhancedRoute<ReduxState, Params, ParamsState, Action> {
  const parser = new RouteParser<Params>(routeParams.path)
  const check = parser.reverse({} as Params)
  const matched = check ? parser.match(check) : false
  const reversed = matched
    ? ((matched as unknown) as Partial<Params>)
    : undefined
  return {
    stateFromParams: (fake as unknown) as EnhancedRoute<
      ReduxState,
      Params,
      ParamsState,
      Action
    >['stateFromParams'],
    paramsFromState: (fake as unknown) as EnhancedRoute<
      ReduxState,
      Params,
      ParamsState,
      Action
    >['paramsFromState'],
    updateState: {},
    state: {} as ParamsState,
    params: {} as Params,
    exitParams: reversed,
    ...routeParams,
    '@parser': parser,
  }
}

export interface EnhancedRoutes {
  [name: string]: EnhancedRoute<
    FullStateWithRouter,
    { [key: string]: string },
    { [key: string]: any },
    any
  >
}

export function save<
  ReduxState extends FullStateWithRouter,
  Params extends { [key: string]: string },
  ParamsState extends { [P in keyof Params]: any },
  Action extends { type: string; [key: string]: any },
  ERoutes extends EnhancedRoutes
>(
  routerParams: DeclareRoute<ReduxState, Params, ParamsState, Action>,
  enhancements: ERoutes
): ERoutes {
  return {
    ...enhancements,
    [routerParams.name]: enhanceRoute(routerParams),
  }
}
