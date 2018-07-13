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
  displayName = 'Link'
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
    this.state = this.setupRoute(props, true)
  }

  componentDidUpdate(props) {
    if (props.route !== this.props.route || props.__routeInfo.routes !== this.props.__routeInfo.routes) {
      this.setupRoute(this.props)
    }
  }

  setupRoute(props, set = false) {
    if (props.route && props.__routeInfo.routes[props.route]) {
      if (set) {
        return { route: new RouteParser(props.__routeInfo.routes[props.route].path) }
      }
      this.setState({ route: new RouteParser(props.__routeInfo.routes[props.route].path) })
    } else {
      if (set) {
        return {}
      }
    }
  }

  click(e) {
    e.preventDefault()
    let url
    const action = this.props.replace ? 'replace' : 'push'
    if (this.props.route) {
      url = this.state.route.reverse(this.props)
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
    const validProps = [
      'download', 'hrefLang', 'referrerPolicy', 'rel', 'target', 'type',
      'id', 'accessKey', 'className', 'contentEditable', 'contextMenu', 'dir', 'draggable',
      'hidden', 'itemID', 'itemProp', 'itemRef', 'itemScope', 'itemType', 'lang',
      'spellCheck', 'style', 'tabIndex', 'title'
    ]
    const aProps = Object.keys(props).reduce((newProps, key) => {
      if (validProps.includes(key)) newProps[key] = props[key] // eslint-disable-line
      if (key.slice(0, 5) === 'data-') newProps[key] = props[key] // eslint-disable-line
      return newProps
    }, {})
    invariant(!href, 'href should not be passed to Link, use "to," "replace" or "route" (passed "%s")', href)
    let landing = replace || to || ''
    if (this.state.route) {
      landing = this.state.route.reverse(props)
    } else if (landing.pathname) {
      landing = `${landing.pathname}${'' + landing.search}${'' + landing.hash}` // eslint-disable-line prefer-template
    }
    return (
      <a href={landing} onClick={this.click} {...aProps}>
        {this.props.children}
      </a>
    )
  }
}

export { Link }

const ContextLink = props => (
  <Context.Consumer>
    {info => (<Link {...props} __routeInfo={info}>{props.children}</Link>)}
  </Context.Consumer>
)

ContextLink.propTypes = {
  children: PropTypes.any
}

export default ContextLink