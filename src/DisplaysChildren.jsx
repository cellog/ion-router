import React, { Component, PropTypes } from 'react'

export default class DisplaysChildren extends Component {
  static propTypes = {
    children: PropTypes.any,
    dispatch: PropTypes.func,
  }

  render() {
    const { children, dispatch, ...props } = this.props // eslint-disable-line no-unused-vars
    return (
      <div>
        {children}
      </div>
    )
  }
}
