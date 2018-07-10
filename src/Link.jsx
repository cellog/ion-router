import React, { Component } from 'react'
import PropTypes from 'prop-types'
import RouteParser from 'route-parser'
import invariant from 'invariant'

import * as actions from './actions'
import Context from './Context'

const urlShape = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.shape({
    pathname: PropTypes.string,
    search: PropTypes.string,
    hash: PropTypes.string,
    state: PropTypes.any
  }),
  PropTypes.bool,
])

class Link extends Component {
  static propTypes = {
    to: urlShape,
    replace: urlShape,
    onClick: PropTypes.func,
    href: PropTypes.string,
    children: PropTypes.any,
    route: PropTypes.string,
    __routeInfo: PropTypes.object,
  }

  constructor(props) {
    super(props)
    this.click = this.click.bind(this)
    this.setupRoute(props)
  }

  componentWillReceiveProps(props) {
    this.setupRoute(props)
  }

  setupRoute(props) {
    if (props.route && props.__routeInfo.routes[props.route]) {
      this.route = new RouteParser(props.__routeInfo.routes[props.route].path)
    }
  }

  click(e) {
    e.preventDefault()
    let url
    const action = this.props.replace ? 'replace' : 'push'
    if (this.props.route) {
      url = this.route.reverse(this.props)
    } else if (this.props.replace) {
      url = this.props.replace
    } else {
      url = this.props.to
    }
    this.props.__routeInfo.dispatch(actions[action](url))
    if (this.props.onClick) {
      this.props.onClick(e)
    }
  }

  render() {
    const {
      __routeInfo: unused, children, href, replace, to, route, onClick, ...props // eslint-disable-line no-unused-vars
    } = this.props
    invariant(!href, 'href should not be passed to Link, use "to," "replace" or "route" (passed "%s")', href)
    let landing = replace || to || ''
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

export default props => (
  <Context.Consumer>
    {info => (<Link {...props} __routeInfo={info}>{props.children}</Link>)}
  </Context.Consumer>
)
