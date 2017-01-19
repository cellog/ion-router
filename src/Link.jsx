import React, { PropTypes, Component } from 'react'
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
      })
    ]),
    replace: PropTypes.string,
    dispatch: PropTypes.func.isRequired,
    onClick: PropTypes.func,
    href: PropTypes.string,
    children: PropTypes.any
  }

  constructor(props) {
    super(props)
    this.click = this.click.bind(this)
  }

  click(e) {
    e.preventDefault()
    if (this.props.replace) {
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
      dispatch, href, replace, to, onClick, ...props // eslint-disable-line no-unused-vars
    } = this.props
    invariant(!href, 'href should not be passed to Link, use "to" (passed "%s")', href)
    let landing = replace || to
    if (landing.pathname) {
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
  ConnectedLink = connect(() => ({}))(Link)
}

const ConnectLink = props => (ConnectedLink ? <ConnectedLink {...props} /> : <Placeholder />)

export default ConnectLink
