import React from 'react'
import PropTypes from 'prop-types'

import DisplaysChildren from './DisplaysChildren'

export const error = () => {
  throw new Error('call connectToggle with the connect function from react-redux to ' +
    'initialize Toggle (see https://github.com/cellog/ion-router/issues/1)')
}

let connect = error

export function connectToggle(c) {
  connect = c
}

export const NullComponent = (Loading, Component, ElseComponent, debug, cons = console) => {
  if (process.env.NODE_ENV !== 'production') {
    const Toggle = ({ '@@__loaded': loadedProp, ...nullProps }) => {
      if (debug) {
        cons.log(`Toggle: loaded: ${loadedProp}, active: ${nullProps['@@__isActive']}`)
        cons.log('Loading component', Loading, 'Component', Component, 'Else', ElseComponent)
      }
      return !loadedProp ? <Loading {...nullProps} />  // eslint-disable-line
        : (nullProps['@@__isActive'] ? <Component {...nullProps} /> : <ElseComponent {...nullProps} />)
    }

    Toggle.propTypes = {
      '@@__loaded': PropTypes.bool,
      '@@__isActive': PropTypes.bool
    }
    return Toggle
  }
  const Toggle = ({ '@@__loaded': loadedProp, ...nullProps }) => (
    !loadedProp ? <Loading {...nullProps} />  // eslint-disable-line
      : (nullProps['@@__isActive'] ? <Component {...nullProps} /> : <ElseComponent {...nullProps} />)
  )

  Toggle.propTypes = {
    '@@__loaded': PropTypes.bool,
    '@@__isActive': PropTypes.bool
  }
  return Toggle
}

export default (isActive, loaded = () => true, componentLoadingMap = {}, debug = false, storeKey = 'store') => {
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

  function Toggle({ component: Component = defaults.component, else: ElseComponent = defaults.else, // eslint-disable-line
      loadingComponent: Loading = defaults.loadingComponent, children, ...props }) {  // eslint-disable-line
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
      const Switcher = NullComponent(Loading, Component, ElseComponent, debug)
      Toggle.HOC = connect(scaffold, undefined, undefined, { storeKey })(Switcher)
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

  const map = ['component', 'loadingComponent', 'else']
  const names = {
    component: 'component',
    loadingComponent: 'loadingComponent',
    else: 'else'
  }
  map.forEach((item) => {
    if (componentLoadingMap[item]) {
      names[item] = componentLoadingMap[item]
    }
  })
  return Toggle
}
