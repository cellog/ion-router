import { connect } from 'react-redux'
import React, { PropTypes, Component } from 'react'

import { push, replace } from './index'

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
    children: PropTypes.any
  }

  constructor(props) {
    super(props)
    this.click = this.click.bind(this)
  }

  click(e) {
    e.preventDefault()
    if (this.props.replace) {
      this.props.dispatch(replace(this.props.replace))
    } else {
      this.props.dispatch(push(this.props.to))
    }
  }

  render() {
    let landing = this.props.replace || this.props.to
    if (landing.pathname) {
      landing = `${landing.pathname}${'' + landing.search}${'' + landing.hash}` // eslint-disable-line prefer-template
    }
    return (
      <a href={landing} onClick={this.click}>
        {this.props.children}
      </a>
    )
  }
}

export { Link }

export default connect(() => ({}), dispatch => ({ dispatch }))(Link)
