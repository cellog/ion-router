import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import DisplaysChildren from './DisplaysChildren'

export default function NullComponent(Loading, Component,
  ElseComponent, Wrapper, wrapperProps, debug, cons = console) {
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
      if (Wrapper === DisplaysChildren) {
        return !loadedProp ? <Loading {...nullProps} />  // eslint-disable-line
          : (nullProps['@@__isActive'] ? <Component {...nullProps} /> : <ElseComponent {...nullProps} />)
      }
      return (
        <Wrapper {...wrapperProps}>
          {!loadedProp ? <Loading {...nullProps} key="loading" />  // eslint-disable-line
            : (nullProps['@@__isActive'] ?
              <Component {...nullProps} key="component" /> :
              <ElseComponent {...nullProps} key="else" />)}
        </Wrapper>
      )
    }
  }

  return Toggle
}
