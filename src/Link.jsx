import React, { Component } from 'react'
import PropTypes from 'prop-types'
import RouteParser from 'route-parser'
import invariant from 'invariant'

import * as actions from './actions'

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
    this.setupRoute(props)
  }

  componentWillReceiveProps(props) {
    this.setupRoute(props)
  }

  setupRoute(props) {
    if (props.route && props['@@__routes'] && props['@@__routes'][props.route]) {
      this.route = new RouteParser(props['@@__routes'][props.route].path)
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
    this.props.dispatch(actions[action](url))
    if (this.props.onClick) {
      this.props.onClick(e)
    }
  }

  render() {
    const {
      '@@__routes': unused, dispatch, href, replace, to, route, onClick, ...props // eslint-disable-line no-unused-vars
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
    if (this.route) {
      landing = this.route.reverse(props)
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

export const Placeholder = () => {
  throw new Error('call connectLink with the connect function from react-redux to ' +
    'initialize Link (see https://github.com/cellog/ion-router/issues/1)')
}

let ConnectedLink = null

export function connectLink(connect) {
  ConnectedLink = connect(state => ({
    '@@__routes': state.routing.routes
  }))(Link)
}

const ConnectLink = props => (ConnectedLink ? <ConnectedLink {...props} /> : <Placeholder />)

export default ConnectLink
