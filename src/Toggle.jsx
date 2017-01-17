import React, { PropTypes } from 'react'
import { connect } from 'react-redux'

import DisplaysChildren from './DisplaysChildren'

export default (isActive, loaded = () => true, componentLoadingMap = {}) => {
  function Toggle({ component = DisplaysChildren, loading = () => null, children, ...props }) {
    const Component = component
    const Loading = loading
    const useProps = { ...props }
    const map = ['component', 'loading']
    map.forEach((item) => {
      if (componentLoadingMap[item]) {
        useProps[item] = props[componentLoadingMap[item]]
        useProps[componentLoadingMap[item]] = undefined
      }
    })

    const NullComponent = ({ '@@__loaded': loaded, ...nullProps }) => ( // eslint-disable-line
      !loaded ? <Loading {...nullProps} />  // eslint-disable-line
        : (nullProps['@@__isActive'] ? <Component {...nullProps} /> : null)
    )

    NullComponent.propTypes = {
      '@@__loaded': PropTypes.bool,
      '@@__isActive': PropTypes.bool
    }

    const R = connect((state, rProps) => {
      const __loaded = loaded(state, rProps) // eslint-disable-line
      return {
        ...rProps,
        '@@__isActive': __loaded && isActive(state, rProps),
        '@@__loaded': __loaded
      }
    })(NullComponent)

    R.displayName = `Toggle(${Component.displayName || Component.name || 'Component'})`
    return (<R {...useProps}>
      {children}
    </R>)
  }

  Toggle.propTypes = {
    component: PropTypes.element,
    loading: PropTypes.element,
    children: PropTypes.any
  }
  return Toggle
}
