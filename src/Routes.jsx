import React, { Component } from 'react'
import PropTypes from 'prop-types'

import * as actions from './actions'
import Context from './Context'

class Routes extends Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
    children: PropTypes.any,
  }

  constructor(props, context) {
    super(props, context)
    this.addRoute = this.addRoute.bind(this)
    this.myRoutes = []
    this.isServer = this.props.store.routerOptions.isServer
    this.state = {
      store: props.store,
      routes: props.store.getState().routing.routes.routes
    }
    this.subscribe = this.subscribe.bind(this)
    this.unsubscribe = props.store.subscribe(this.subscribe)
  }

  componentDidUpdate(props) {
    if (props.store !== this.state.store) {
      this.setState({
        store: props.store,
        routes: props.store.getState().routing.routes.routes
      })
    }
  }
  componentDidMount() {
    this.state.store.dispatch(actions.batchRoutes(this.myRoutes))
  }

  componentWillUnmount() {
    this.unsubscribe()
    this.state.store.dispatch(actions.batchRemoveRoutes(this.myRoutes))
  }

  subscribe() {
    const newRoutes = this.state.store.getState().routing.routes.routes
    if (newRoutes !== this.state.routes) {
      this.setState({
        routes: newRoutes
      })
    }
  }

  addRoute(route) {
    this.myRoutes.push(route)
    if (this.isServer) {
      this.state.store.dispatch(actions.addRoute(route))
    }
  }

  render() {
    const { store, children } = this.props
    const value = {
      dispatch: store.dispatch,
      routes: this.state.routes,
      addRoute: this.addRoute,
      store: this.state.store,
    }
    return (<Context.Provider value={value}>
      {children}
    </Context.Provider>)
  }
}

function ChooseRoutes({ store, children }) {
  if (!store) {
    return (
      <>
        {children}
      </>
    )
  }
  return <Routes store={store}>{children}</Routes>
}

export default ChooseRoutes
