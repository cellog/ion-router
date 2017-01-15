import React, { Component } from 'react'

export default class DisplaysChildren extends Component {
  render() {
    const { children, dispatch, ...props } = this.props
    return (
      <div>
        {children}
      </div>
    )
  }
}
