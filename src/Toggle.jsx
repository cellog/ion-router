import React, { PropTypes } from 'react'

import DisplaysChildren from './DisplaysChildren'

let connect = () => {
  throw new Error('call connectToggle with the connect function from react-redux to ' +
    'initialize Toggle (see https://github.com/cellog/react-redux-saga-router/issues/1)')
}

export function connectToggle(c) {
  connect = c
}

const NullComponent = (Loading, Component, ElseComponent) => {
  const Ret = ({ '@@__loaded': loadedProp, ...nullProps }) => (
    !loadedProp ? <Loading {...nullProps} />  // eslint-disable-line
    : (nullProps['@@__isActive'] ? <Component {...nullProps} /> : <ElseComponent {...nullProps} />)
  )

  Ret.propTypes = {
    '@@__loaded': PropTypes.bool,
    '@@__isActive': PropTypes.bool
  }

  return Ret
}

export default (isActive, loaded = () => true, componentLoadingMap = {}) => {
  const scaffold = (state, rProps) => {
    const loadedTest = !!loaded(state, rProps)
    return {
      ...rProps,
      '@@__isActive': loadedTest && !!isActive(state, rProps),
      '@@__loaded': loadedTest
    }
  }

  const defaults = {
    component: DisplaysChildren,
    else: () => null,
    loadingComponent: () => null
  }
  defaults.else.displayName = 'null'
  defaults.loadingComponent.displayName = 'null'

  const lastProps = {
    component: null,
    else: null,
    loadingComponent: null
  }

  function Toggle({ component: Component = defaults.component, else: ElseComponent = defaults.else,
      loadingComponent: Loading = defaults.loadingComponent, children, ...props }) {
    const useProps = { ...props }
    const map = ['component', 'loadingComponent', 'else']
    map.forEach((item) => {
      if (componentLoadingMap[item]) {
        useProps[item] = props[componentLoadingMap[item]]
        useProps[componentLoadingMap[item]] = undefined
      }
    })

    if (Component !== lastProps.component || ElseComponent !== lastProps.else
      || Loading !== lastProps.loadingComponent) {
      lastProps.component = Component
      lastProps.else = ElseComponent
      lastProps.loadingComponent = Loading
      const Switcher = NullComponent(Loading, Component, ElseComponent)
      Toggle.HOC = connect(scaffold)(Switcher)
      const elseName = ElseComponent.displayName || ElseComponent.name || 'Component'
      const componentName = Component.displayName || Component.name || 'Component'
      const loadingName = Loading.displayName || Loading.name || 'Component'
      Toggle.HOC.displayName = `Toggle(component:${componentName},else:${elseName},loading:${loadingName})`
    }

    const HOC = Toggle.HOC
    return (<HOC {...useProps}>
      {children}
    </HOC>)
  }

  Toggle.propTypes = {
    component: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
    loadingComponent: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
    else: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
    children: PropTypes.any
  }
  return Toggle
}
