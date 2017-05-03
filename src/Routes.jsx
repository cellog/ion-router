import React, { Component, Children } from 'react'
import PropTypes from 'prop-types'
import * as actions from './actions'

export const RawRoutes = (storeKey = 'store') => class extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    children: PropTypes.any,
    '@@__routes': PropTypes.object,
  }

  static contextTypes = {
    [storeKey]: PropTypes.object
  }

  constructor(props, context) {
    super(props, context)
    this.addRoute = this.addRoute.bind(this)
    this.myRoutes = []
    this.isServer = this.context[storeKey].routerOptions.isServer
  }

  componentDidMount() {
    this.props.dispatch(actions.batchRoutes(this.myRoutes))
  }

  componentWillUnmount() {
    this.props.dispatch(actions.batchRemoveRoutes(this.myRoutes))
  }

  addRoute(route) {
    this.myRoutes.push(route)
    if (this.isServer) {
      this.props.dispatch(actions.addRoute(route))
    }
  }

  render() {
    const { dispatch, '@@__routes': routes, children } = this.props // eslint-disable-line
    return (<div style={{ display: 'none' }}>
      {children && Children.map(children, child => React.cloneElement(child, {
        '@@__routes': routes,
        '@@AddRoute': this.addRoute,
      }))}
    </div>)
  }
}

export const Placeholder = () => {
  throw new Error('call connectRoutes with the connect function from react-redux to ' +
    'initialize Routes (see https://github.com/cellog/ion-router/issues/1)')
}

export function getConnectedRoutes(connect, storeKey = 'store', Raw = RawRoutes(storeKey)) {
  return connect(state => ({ '@@__routes': state.routing.routes.routes }),
    undefined, undefined, { storeKey })(Raw)
}

let ConnectedRoutes = null

export function connectRoutes(connect, storeKey = 'store', Raw = RawRoutes(storeKey)) {
  ConnectedRoutes = getConnectedRoutes(connect, storeKey, Raw)
}

const ConnectRoutes = props => (ConnectedRoutes ? <ConnectedRoutes {...props} /> : <Placeholder />)

export default ConnectRoutes
