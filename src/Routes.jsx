import React, { Component } from 'react'
import PropTypes from 'prop-types'

import * as actions from './actions'
import { Context as ReduxContext } from 'react-redux'
import Context from './Context'

class Routes extends Component {
  static propTypes = {
    children: PropTypes.any,
  }

  constructor(props, context) {
    super(props, context)
    this.addRoute = this.addRoute.bind(this)
    this.myRoutes = []
    this.value = {}
  }

  componentDidMount() {
    if (this.myRoutes.length) {
      this.value.store.dispatch(actions.batchRoutes(this.myRoutes))
    }
  }

  componentWillUnmount() {
    if (this.myRoutes.length) {
      this.value.store.dispatch(actions.batchRemoveRoutes(this.myRoutes))
    }
  }

  addRoute(route) {
    this.myRoutes.push(route)
    if (this.isServer) {
      this.value.store.dispatch(actions.addRoute(route))
    }
  }

  render() {
    return (
      <ReduxContext.Consumer>
        {({ store, state }) => {
        if (this.value.store !== store) {
          this.isServer = store.routerOptions.isServer
          this.value = {
            dispatch: store.dispatch,
            routes: state.routing.routes.routes,
            addRoute: this.addRoute,
            store,
          }
        }
        return (
          <Context.Provider value={this.value}>
            {this.props.children}
          </Context.Provider>
        )
      }}
      </ReduxContext.Consumer>
    )
  }
}

export default Routes
