import React, { PropTypes, Component, Children } from 'react'
import * as actions from './actions'
import { onServer } from '.'

export class RawRoutes extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    children: PropTypes.any,
    '@@__routes': PropTypes.object,
  }

  constructor(props) {
    super(props)
    this.addRoute = this.addRoute.bind(this)
    this.myRoutes = []
    this.isServer = onServer()
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
    'initialize Routes (see https://github.com/cellog/react-redux-saga-router/issues/1)')
}

let ConnectedRoutes = null

export function connectRoutes(connect) {
  ConnectedRoutes = connect(state => ({ '@@__routes': state.routing.routes.routes }))(RawRoutes)
}

const ConnectRoutes = props => (ConnectedRoutes ? <ConnectedRoutes {...props} /> : <Placeholder />)

export default ConnectRoutes
