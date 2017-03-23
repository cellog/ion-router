import React, { Component, PropTypes } from 'react'
import * as actions from './actions'

export function fake() {
  return {}
}

class Route extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    paramsFromState: PropTypes.func,
    stateFromParams: PropTypes.func,
    updateState: PropTypes.object,
    dispatch: PropTypes.func,
    '@@__routes': PropTypes.array,
    parentUrl: PropTypes.string,
    parent: PropTypes.string,
    children: PropTypes.any
  }
  static defaultProps = {
    paramsFromState: fake,
    stateFromParams: fake,
    updateState: {}
  }
  constructor(props) {
    super(props)
    const { dispatch, parent, '@@__routes': routes, parentUrl, children, ...params } = props // eslint-disable-line no-unused-vars
    let url = parentUrl
    if (parent && routes && routes[parent]) {
      url = routes[parent].path
    }
    const slash = url && url[url.length - 1] === '/' ? '' : '/'
    const path = url ? `${url}${slash}${params.path}` : params.path
    dispatch(actions.createRoute({ ...params, path }))
    this.url = path
  }

  render() {
    const { dispatch, '@@__routes': routes, children } = this.props
    return (<div style={{ display: 'none' }}>
      {children && React.cloneElement(children, { dispatch, '@@__routes': routes, parentUrl: this.url })}
    </div>)
  }
}

export default Route
