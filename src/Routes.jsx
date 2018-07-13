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
      value: {
        dispatch: props.store.dispatch,
        routes: props.store.getState().routing.routes.routes,
        addRoute: this.addRoute,
        store: props.store,
      }
    }
    this.subscribe = this.subscribe.bind(this)
    this.unsubscribe = props.store.subscribe(this.subscribe)
  }

  componentDidUpdate(props) {
    if (this.props.store !== props.store) {
      this.unsubscribe()
      this.unsubscribe = this.props.store.subscribe(this.subscribe)
      this.setState({
        value: {
          dispatch: this.props.store.dispatch,
          routes: this.props.store.getState().routing.routes.routes,
          addRoute: this.addRoute,
          store: this.props.store,
        }
      })
      this.queued = false
    }
  }
  componentDidMount() {
    if (this.myRoutes.length) {
      this.state.value.store.dispatch(actions.batchRoutes(this.myRoutes))
    }
  }

  componentWillUnmount() {
    this.unsubscribe()
    if (this.myRoutes.length) {
      this.state.value.store.dispatch(actions.batchRemoveRoutes(this.myRoutes))
    }
  }

  subscribe() {
    const newRoutes = this.state.value.store.getState().routing.routes.routes
    if (newRoutes !== this.state.value.routes) {
      if (this.queued !== newRoutes) {
        this.queued = newRoutes
        this.setState({
          value: {
            dispatch: this.state.value.store.dispatch,
            routes: newRoutes,
            addRoute: this.addRoute,
            store: this.state.value.store,
          }
        }, () => this.queued = false)
      }
    }
  }

  addRoute(route) {
    this.myRoutes.push(route)
    if (this.isServer) {
      this.state.value.store.dispatch(actions.addRoute(route))
    }
  }

  render() {
    return (<Context.Provider value={this.state.value}>
      {this.props.children}
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

ChooseRoutes.propTypes = {
  store: PropTypes.object,
  children: PropTypes.any
}

export default ChooseRoutes
