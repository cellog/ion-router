import RouteParser from 'route-parser'
import { IonRouterRoute } from './actions'
import { FullStateWithRouter } from './selectors'

export interface DeclareRoute<
  State,
  Params extends { [P in keyof State]: string },
  Action extends { type: string; [key: string]: any }
> {
  name: string
  path: string
  parent: string
  stateFromParams?: (t: Params, s?: FullStateWithRouter) => State
  paramsFromState?: (t: State) => Params
  updateState?: MapInBetweenActions<State, Action>
  exitParams?: ((exitParams: Params) => Partial<Params>) | Partial<Params>
}

export type MapInBetweenActions<InBetweenState, Action> = Partial<
  {
    [P in keyof InBetweenState]?: (
      param: InBetweenState[P],
      state: InBetweenState
    ) => Action | Action[]
  }
>

export interface EnhancedRoute<
  State,
  Params extends { [P in keyof State]: string },
  Action extends { type: string; [key: string]: any }
> extends DeclareRoute<State, Params, Action>, IonRouterRoute<State, Params> {
  stateFromParams: (t: Params, s?: FullStateWithRouter) => State
  paramsFromState: (t: State) => Params
  updateState: MapInBetweenActions<State, Action>
  exitParams?: ((exitParams: Params) => Partial<Params>) | Partial<Params>
  '@parser': RouteParser<Params>
}

export type GetUpdateStateReturn<
  E extends EnhancedRoute<any, any, any>,
  key extends keyof E['updateState']
> = E['updateState'][key] extends (param: any, state: any) => infer R
  ? R
  : false

export const fake = () => ({})

export function enhanceRoute<
  State,
  Params extends { [P in keyof State]: string },
  Action extends { type: string; [key: string]: any }
>(
  routeParams: DeclareRoute<State, Params, Action>
): EnhancedRoute<State, Params, Action> {
  const parser = new RouteParser<Params>(routeParams.path)
  const check = parser.reverse({} as Params)
  const matched = check ? parser.match(check) : false
  const reversed = matched
    ? ((matched as unknown) as Partial<Params>)
    : undefined
  return {
    stateFromParams: (fake as unknown) as EnhancedRoute<
      State,
      Params,
      Action
    >['stateFromParams'],
    paramsFromState: (fake as unknown) as EnhancedRoute<
      State,
      Params,
      Action
    >['paramsFromState'],
    updateState: {},
    state: {} as State,
    params: {} as Params,
    exitParams: reversed,
    ...routeParams,
    '@parser': parser,
  }
}

export interface EnhancedRoutes {
  [name: string]: EnhancedRoute<any, { [key: string]: string }, any>
}

export function save<
  State,
  Params extends { [P in keyof State]: string },
  Action extends { type: string },
  ERoutes extends EnhancedRoutes
>(
  routerParams: DeclareRoute<State, Params, Action>,
  enhancements: ERoutes
): ERoutes {
  return {
    ...enhancements,
    [routerParams.name]: enhanceRoute(routerParams),
  }
}
