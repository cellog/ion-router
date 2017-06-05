import React, { Component as ReactComponent } from 'react'

import DisplaysChildren from './DisplaysChildren'
import NullComponent from './NullComponent'

export const error = () => {
  throw new Error('call connectToggle with the connect function from react-redux to ' +
    'initialize Toggle (see https://github.com/cellog/ion-router/issues/1)')
}

let connect = error

export function connectToggle(c) {
  connect = c
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

  class Toggle extends ReactComponent {

    constructor(props) {
      super(props)
      this.lastComponents = {
        component: false,
        else: false,
        loadingComponent: false
      }
      this.makeHOC(props)
      this.rendered = 0
    }

    makeHOC(props) {
      const {
        component: Component = defaults.component, else: ElseComponent = defaults.else, // eslint-disable-line
        loadingComponent: Loading = defaults.loadingComponent // eslint-disable-line
      } = props
      this.lastComponents = {
        component: Component,
        else: ElseComponent,
        loadingComponent: Loading
      }
      const Switcher = NullComponent(Loading, Component, ElseComponent, debug)
      const HOC = connect(scaffold, undefined, undefined, { storeKey })(Switcher)
      const elseName = ElseComponent.displayName || ElseComponent.name || 'Component'
      const componentName = Component.displayName || Component.name || 'Component'
      const loadingName = Loading.displayName || Loading.name || 'Component'
      HOC.displayName = `Toggle(component:${componentName},else:${elseName},loading:${loadingName})`
      this.HOC = HOC
    }

    init(newprops) {
      const {
        component: Component = defaults.component, else: ElseComponent = defaults.else,
        loadingComponent: Loading = defaults.loadingComponent
      } = newprops
      if (Component !== this.lastComponents.component || ElseComponent !== this.lastComponents.else
        || Loading !== this.lastComponents.loadingComponent) {
        this.makeHOC(newprops)
      }
    }

    shouldComponentUpdate(newprops) {
      const {
        component: Component = defaults.component, else: ElseComponent = defaults.else,
        loadingComponent: Loading = defaults.loadingComponent, children
      } = newprops
      if (Component !== this.lastComponents.component || ElseComponent !== this.lastComponents.else
        || Loading !== this.lastComponents.loadingComponent || children !== this.props.children) {
        this.init(newprops)
        return true
      }
      return false
    }

    render() {
      this.rendered++
      const {
        component, else: unused, loadingComponent, children, ...props // eslint-disable-line
      } = this.props
      const useProps = { ...props }
      const map = ['component', 'loadingComponent', 'else']
      map.forEach((item) => {
        if (componentLoadingMap[item]) {
          useProps[item] = props[componentLoadingMap[item]]
          useProps[componentLoadingMap[item]] = undefined
        }
      })

      const HOC = this.HOC
      return (<HOC {...useProps}>
        {children}
      </HOC>)
    }
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
