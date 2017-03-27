import React, { PropTypes, Component } from 'react'
import RouteParser from 'route-parser'
import invariant from 'invariant'

import * as actions from './actions'

class Link extends Component {
  static propTypes = {
    to: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        pathname: PropTypes.string,
        search: PropTypes.string,
        hash: PropTypes.string,
        state: PropTypes.any
      }),
      PropTypes.bool,
    ]),
    replace: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        pathname: PropTypes.string,
        search: PropTypes.string,
        hash: PropTypes.string,
        state: PropTypes.any
      }),
      PropTypes.bool,
    ]),
    dispatch: PropTypes.func.isRequired,
    onClick: PropTypes.func,
    href: PropTypes.string,
    children: PropTypes.any,
    route: PropTypes.string,
    '@@__routes': PropTypes.object,
  }

  constructor(props) {
    super(props)
    this.click = this.click.bind(this)
    if (props.route && props['@@__routes'] && props['@@__routes'][props.route]) {
      this.route = new RouteParser(props['@@__routes'][props.route].path)
    }
  }

  componentWillReceiveProps(props) {
    if (props.route && props['@@__routes'] && props['@@__routes'][props.route]) {
      this.route = new RouteParser(props['@@__routes'][props.route].path)
    }
  }

  click(e) {
    e.preventDefault()
    if (this.props.route) {
      if (this.props.replace) {
        this.props.dispatch(actions.replace(this.route.reverse(this.props)))
      } else {
        this.props.dispatch(actions.push(this.route.reverse(this.props)))
      }
    } else if (this.props.replace) {
      this.props.dispatch(actions.replace(this.props.replace))
    } else {
      this.props.dispatch(actions.push(this.props.to))
    }
    if (this.props.onClick) {
      this.props.onClick(e)
    }
  }

  render() {
    const {
      '@@__routes': unused, dispatch, href, replace, to, route, onClick, ...props // eslint-disable-line no-unused-vars
    } = this.props
    invariant(!href, 'href should not be passed to Link, use "to," "replace" or "route" (passed "%s")', href)
    let landing = replace || to
    if (this.route) {
      landing = this.route.reverse(props)
    } else if (landing.pathname) {
      landing = `${landing.pathname}${'' + landing.search}${'' + landing.hash}` // eslint-disable-line prefer-template
    }
    return (
      <a href={landing} onClick={this.click} {...props}>
        {this.props.children}
      </a>
    )
  }
}

export { Link }

export const Placeholder = () => {
  throw new Error('call connectLink with the connect function from react-redux to ' +
    'initialize Link (see https://github.com/cellog/react-redux-saga-router/issues/1)')
}

let ConnectedLink = null

export function connectLink(connect) {
  ConnectedLink = connect(state => ({
    '@@__routes': state.routing.routes
  }))(Link)
}

const ConnectLink = props => (ConnectedLink ? <ConnectedLink {...props} /> : <Placeholder />)

export default ConnectLink
