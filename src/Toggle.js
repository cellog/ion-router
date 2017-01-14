import React from 'react'
import { connect } from 'react-redux'

export default (isActive, loaded = () => true, componentLoadingMap = {}) =>
    ({ component = (props) => <div {...props} />, loading = () => null, ...props }) => {
  const Component = component
  const Loading = loading
  if (componentLoadingMap.component) {
    props.component = componentLoadingMap.component
    props[componentLoadingMap.component] = undefined
  }
  if (componentLoadingMap.loading) {
    props.loading = componentLoadingMap.loading
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
  return <R {...props} />
}