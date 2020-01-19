import React, { memo } from 'react'
import { useSelector } from 'react-redux'

import DisplaysChildren from './DisplaysChildren'
import { FullStateWithRouter } from './selectors'

export type ReduxSelector = <P extends { [key: string]: any }>(
  state: FullStateWithRouter,
  props?: P
) => any

export type LoadedSelector = <P extends { [key: string]: any }>(
  state: FullStateWithRouter,
  props?: P
) => boolean

export interface ToggleDefaults {
  component: React.FC<any>
  else: React.FC<any>
  loadingComponent: React.FC<any>
}

export interface MightDefineVars {
  [key: string]: any
  component?: any
  loadingComponent?: any
  else?: any
}

export interface ComponentLoadingMap<ExtraProps extends MightDefineVars> {
  component?: keyof ExtraProps
  else?: keyof ExtraProps
  loadingComponent?: keyof ExtraProps
}

export type ToggleProps<ExtraProps extends MightDefineVars> = ToggleDefaults &
  ExtraProps & {
    children: React.ReactChild
  }

function isKeyofExtraProps<ExtraProps extends MightDefineVars>(
  key: any
): key is keyof ExtraProps {
  return !!key
}

const defaults: ToggleDefaults = {
  component: DisplaysChildren,
  else: () => null,
  loadingComponent: () => null,
}
defaults.else.displayName = 'null'
defaults.loadingComponent.displayName = 'null'

export default function OuterToggle<ExtraProps extends MightDefineVars>(
  selector: ReduxSelector,
  loaded: LoadedSelector = () => true,
  componentLoadingMap: ComponentLoadingMap<ExtraProps> = {}
) {
  return memo(function Toggle({
    component: Component = defaults.component,
    else: ElseComponent = defaults.else,
    loadingComponent: LoadingComponent = defaults.loadingComponent,
    children,
    ...extra
  }: ToggleProps<ExtraProps>) {
    const map: (keyof ComponentLoadingMap<ExtraProps>)[] = [
      'component',
      'loadingComponent',
      'else',
    ]
    const useProps: ExtraProps = (extra as unknown) as ExtraProps
    map.forEach(item => {
      const key = componentLoadingMap[item]
      if (isKeyofExtraProps<ExtraProps>(key)) {
        useProps[item] = useProps[key]
        // no idea why this is required. Last resort of the desperate
        useProps[key] = (undefined as unknown) as ExtraProps[keyof ExtraProps]
      }
    })

    const isLoaded = useSelector<FullStateWithRouter>(state =>
      loaded(state, useProps)
    )
    const toggleIsOn = useSelector<FullStateWithRouter>(state => {
      if (!isLoaded) return false
      return selector(state, useProps)
    })
    if (toggleIsOn) {
      if (!isLoaded) {
        return <LoadingComponent {...useProps} />
      }
      return <Component {...useProps}>{children}</Component>
    } else {
      if (!isLoaded) {
        return <LoadingComponent {...useProps} />
      }
      return <ElseComponent {...useProps} />
    }
  })
}
