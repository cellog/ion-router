import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

export default function NullComponent(Loading, Component, ElseComponent, debug, cons = console) {
  class Toggle extends PureComponent {
    static propTypes = {
      '@@__loaded': PropTypes.bool,
      '@@__isActive': PropTypes.bool
    }

    constructor(props) {
      super(props)
      this.rendered = 0
    }

    render() {
      this.rendered++
      const { '@@__loaded': loadedProp, ...nullProps } = this.props
      if (debug) {
        cons.log(`Toggle: loaded: ${loadedProp}, active: ${nullProps['@@__isActive']}`)
        cons.log('Loading component', Loading, 'Component', Component, 'Else', ElseComponent)
      }
      return !loadedProp ? <Loading {...nullProps} />  // eslint-disable-line
        : (nullProps['@@__isActive'] ? <Component {...nullProps} /> : <ElseComponent {...nullProps} />)
    }
  }

  return Toggle
}
