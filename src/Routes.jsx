import React, { useState, useEffect, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'

import * as actions from './actions'
import { useStore, useDispatch, useSelector } from 'react-redux'
import Context from './Context'

function Routes({ children }) {
  const myRoutes = useRef([])
  const store = useStore()
  const dispatch = useDispatch()
  const routes = useSelector(state => state.routing.routes.routes)

  const addRoute = useCallback((route) => {
    myRoutes.current.push(route)
    if (store.routerOptions.isServer) {
      dispatch(actions.addRoute(route))
    }
  }, [dispatch, store])

  const [value, setValue] = useState({
    dispatch,
    routes,
    addRoute,
    store,
  })

  useEffect(() => {
    setValue({
      dispatch,
      routes,
      addRoute,
      store,
    })
  }, [dispatch, routes, store, addRoute])

  useEffect(() => {
    if (myRoutes.current.length) {
      dispatch(actions.batchRoutes(myRoutes.current))
    }
    return () => {
      if (myRoutes.current.length) {
        dispatch(actions.batchRemoveRoutes((myRoutes.current)))
      }
    }
  }, [myRoutes])

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  )
}

Routes.propTypes = {
  children: PropTypes.any,
}

export default Routes
