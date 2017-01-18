import React, { PropTypes } from 'react'
import { connect } from 'react-redux'

import DisplaysChildren from './DisplaysChildren'

export default (isActive, loaded = () => true, componentLoadingMap = {}) => {
  function Toggle({ component: Component = DisplaysChildren, else: ElseComponent = () => null,
      loadingComponent: Loading = () => null, children, ...props }) {
    const useProps = { ...props }
    const map = ['component', 'loadingComponent', 'else']
    map.forEach((item) => {
      if (componentLoadingMap[item]) {
        useProps[item] = props[componentLoadingMap[item]]
        useProps[componentLoadingMap[item]] = undefined
      }
    })

    const NullComponent = ({ '@@__loaded': loadedProp, ...nullProps }) => ( // eslint-disable-line
      !loadedProp ? <Loading {...nullProps} />  // eslint-disable-line
        : (nullProps['@@__isActive'] ? <Component {...nullProps} /> : <ElseComponent {...nullProps} />)
    )

    NullComponent.propTypes = {
      '@@__loaded': PropTypes.bool,
      '@@__isActive': PropTypes.bool
    }

    const R = connect((state, rProps) => {
      const loadedTest = !!loaded(state, rProps)
      return {
        ...rProps,
        '@@__isActive': loadedTest && !!isActive(state, rProps),
        '@@__loaded': loadedTest
      }
    })(NullComponent)

    R.displayName = `Toggle(${Component.displayName || Component.name || 'Component'})`
    return (<R {...useProps}>
      {children}
    </R>)
  }

  Toggle.propTypes = {
    component: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
    loadingComponent: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
    else: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
    children: PropTypes.any
  }
  return Toggle
}
