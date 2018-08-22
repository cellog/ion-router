import React from 'react'

import DisplaysChildren from './DisplaysChildren'
import { If, Else, Loading } from './If'

const defaults = {
  component: DisplaysChildren,
  else: () => null,
  loadingComponent: () => null,
}
defaults.else.displayName = 'null'
defaults.loadingComponent.displayName = 'null'

export default function(selector, loaded = () => true, componentLoadingMap = {}) {
  return function Toggle({
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
    return (
      <If selector={selector} loadedSelector={loaded} selectorProps={useProps}>
        <Component {...useProps}>
          {children}
        </Component>
        {ElseComponent !== defaults.else ?
          <Else>
            <ElseComponent {...useProps} />
          </Else>
        : null}
        {LoadingComponent !== defaults.loadingComponent ?
          <Loading>
            <LoadingComponent {...useProps} />
          </Loading>
        : null }
      </If>
    )
  }
}
