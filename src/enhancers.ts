import RouteParser from 'route-parser'
import { IonRouterRoute, RouteParams } from './actions'

export interface DeclareRoute<
  State,
  Params extends { [P in keyof State]: string },
  Action extends { type: string }
> {
  name: string
  path: string
  parent: string
  stateFromParams: (t: Params) => State
  paramsFromState: (t: State) => Params
  updateState: MapInBetweenActions<State, Action>
  exitParams?: ((exitState: State) => Partial<State>) | Partial<State>
}

export type MapInBetweenActions<InBetweenState, Action> = Partial<
  {
    [P in keyof InBetweenState]: (
      param: InBetweenState[P],
      state: InBetweenState
    ) => false | Action
  }
>

interface EnhancedRoute<
  State,
  Params extends { [P in keyof State]: string },
  Action extends { type: string }
> extends DeclareRoute<State, Params, Action>, IonRouterRoute<State, Params> {
  '@parser': RouteParser<Params>
}

type EnhancedRoutes<
  State,
  Params extends { [P in keyof State]: string },
  Action extends { type: string }
> = EnhancedRoute<State, Params, Action>[]

export const fake = () => ({})

export function enhanceRoute<
  State,
  Params extends { [P in keyof State]: string },
  Action extends { type: string }
>(
  routeParams: DeclareRoute<State, Params, Action>
): EnhancedRoute<State, Params, Action> {
  const parser = new RouteParser<Params>(routeParams.path)
  const check = parser.reverse({} as Params)
  const matched = check ? parser.match(check) : false
  const reversed = matched
    ? ((matched as unknown) as Partial<State>)
    : undefined
  return {
    stateFromParams: fake,
    paramsFromState: fake,
    updateState: {},
    state: {} as State,
    params: {} as Params,
    exitParams: reversed,
    ...routeParams,
    '@parser': parser,
  }
}

export function save<
  State,
  Params extends { [P in keyof State]: string },
  Action extends { type: string },
  AllState,
  AllParams extends { [P in keyof AllState]: string },
  AllActions extends { type: string }
>(
  routerParams: DeclareRoute<State, Params, Action>,
  enhancements: EnhancedRoutes<AllState, AllParams, AllActions>
) {
  return {
    ...enhancements,
    [routerParams.name]: enhanceRoute(routerParams),
  }
}
