import React from 'react'
import { connect } from 'react-redux'

export const DisplaysChildren = ({ children, dispatch, ...props }) => (<div>
  {children}
</div>)

export default (isActive, loaded = () => true, componentLoadingMap = {}) =>
    ({ component = DisplaysChildren, loading = () => null, children, ...props }) => {
  const Component = component
  const Loading = loading
  if (componentLoadingMap.component) {
    props.component = props[componentLoadingMap.component]
    props[componentLoadingMap.component] = undefined
  }
  if (componentLoadingMap.loading) {
    props.loading = props[componentLoadingMap.loading]
    props[componentLoadingMap.loading] = undefined
  }
  const NullComponent = ({ '@@__isActive': active, '@@__loaded': loaded, ...props }) => (
    !loaded ? <Loading {...props} />
      : ( active ? <Component {...props} /> : null )
  )
  const R = connect((state, props) => {
    const __loaded = loaded(state, props)
    return {
      ...props,
      '@@__isActive': __loaded && isActive(state, props),
      '@@__loaded': __loaded
    }
  })(NullComponent)
  R.displayName = `Toggle(${Component.displayName || Component.name || 'Component'})`
  return <R {...props}>
    {children}
  </R>
}