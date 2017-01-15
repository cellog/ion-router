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
    parentUrl: PropTypes.string,
    children: PropTypes.any
  }
  static defaultProps = {
    paramsFromState: fake,
    stateFromParams: fake,
    updateState: {}
  }
  constructor(props) {
    super(props)
    const { dispatch, parentUrl, children, ...params } = props // eslint-disable-line no-unused-vars
    const slash = parentUrl && parentUrl[parentUrl.length - 1] === '/' ? '' : '/'
    const path = parentUrl ? `${parentUrl}${slash}${params.path}` : params.path
    dispatch(actions.createRoute({ ...params, path }))
    this.url = path
  }

  render() {
    const { dispatch, children } = this.props
    return (<div style={{ display: 'none' }}>
      {children && React.cloneElement(children, { dispatch, parentUrl: this.url })}
    </div>)
  }
}

export default Route
