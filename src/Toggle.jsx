import React, { memo } from 'react'
import { useSelector } from 'react-redux'

import DisplaysChildren from './DisplaysChildren'

const defaults = {
  component: DisplaysChildren,
  else: () => null,
  loadingComponent: () => null,
}
defaults.else.displayName = 'null'
defaults.loadingComponent.displayName = 'null'

export default function(selector, loaded = () => true, componentLoadingMap = {}) {
  return memo(function Toggle({
                           component: Component = defaults.component, else: ElseComponent = defaults.else, // eslint-disable-line
                           loadingComponent: LoadingComponent = defaults.loadingComponent, // eslint-disable-line
                           ...extra
                         }) {
    const {
      component, else: unused, loadingComponent, children, ...useProps // eslint-disable-line
    } = extra
    const map = ['component', 'loadingComponent', 'else']
    map.forEach((item) => {
      if (componentLoadingMap[item]) {
        useProps[item] = useProps[componentLoadingMap[item]]
        useProps[componentLoadingMap[item]] = undefined
      }
    })

    const isLoaded = useSelector((state) => loaded(state, useProps))
    const toggleIsOn = useSelector((state) => {
      if (!isLoaded) return false
      return selector(state, useProps)
    })
    if (toggleIsOn) {
      if (!isLoaded) {
        return <LoadingComponent {...useProps} />
      }
      return (
        <Component {...useProps}>
          {children}
        </Component>
      )
    } else {
      if (!isLoaded) {
        return <LoadingComponent {...useProps} />
      }
      return <ElseComponent {...useProps} />
    }
  })
}
