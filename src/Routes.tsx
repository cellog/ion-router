import React, { useState, useEffect, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'

import * as actions from './actions'
import { useStore, useDispatch, useSelector } from 'react-redux'
import Context, { RouterContext } from './Context'
import { FullStateWithRouter } from './selectors'
import { IonRouterOptions } from './storeEnhancer'
import { DeclareRoute } from './enhancers'
import { Store } from 'redux'
import { IonRouterState } from './reducer'

export function Routes<
  ReduxState extends FullStateWithRouter,
  Params extends { [key: string]: string },
  ParamsState extends { [key: string]: any },
  Action extends { type: string; [key: string]: any }
>({ children }: { children: React.ReactNode }) {
  const myRoutes = useRef<
    DeclareRoute<ReduxState, Params, ParamsState, Action>[]
  >([])
  const store: Store<ReduxState> & IonRouterOptions = useStore<
    FullStateWithRouter
  >() as Store<ReduxState> & IonRouterOptions
  const dispatch = useDispatch()
  const routes = useSelector<
    FullStateWithRouter,
    IonRouterState['routes']['routes']
  >(state => state.routing.routes.routes)

  const addRoute = useCallback(
    (route: DeclareRoute<ReduxState, Params, ParamsState, Action>) => {
      myRoutes.current.push(route)
      if (store.routerOptions.isServer) {
        dispatch(actions.addRoute(route))
      }
    },
    [dispatch, store]
  )

  const [value, setValue] = useState<RouterContext>({
    dispatch,
    routes,
    addRoute,
    store,
  } as RouterContext)

  useEffect(() => {
    setValue({
      dispatch,
      routes,
      addRoute,
      store,
    } as RouterContext)
  }, [dispatch, routes, store, addRoute])

  useEffect(() => {
    if (myRoutes.current.length) {
      dispatch(
        actions.batchRoutes(
          myRoutes.current as DeclareRoute<FullStateWithRouter, any, any, any>[]
        )
      )
    }
    return () => {
      if (myRoutes.current.length) {
        dispatch(
          actions.batchRemoveRoutes(
            myRoutes.current as DeclareRoute<
              FullStateWithRouter,
              any,
              any,
              any
            >[]
          )
        )
      }
    }
  }, [myRoutes.current])

  return <Context.Provider value={value}>{children}</Context.Provider>
}

Routes.propTypes = {
  children: PropTypes.any,
}

export default Routes
