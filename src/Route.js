import React, { Component, PropTypes } from 'react'
import * as actions from './actions'

class Route extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    paramsFromState: PropTypes.function,
    stateFromParams: PropTypes.function,
    updateState: PropTypes.object
  }
  constructor(props) {
    super(props)
    const { dispatch, parentUrl, children, ...params } = props
    const slash = parentUrl && parentUrl[parentUrl.length - 1] == '/' ? '' : '/'
    const path = parentUrl ? `${parentUrl}${slash}` + params.path : params.path
    dispatch(actions.createRoute({...params, path }))
    this.url = path
  }

  render() {
    const { dispatch, parentUrl, children, ...params } = this.props
    return <div style={{display: 'none'}}>
      {children && React.cloneElement(children, { dispatch, parentUrl: this.url })}
    </div>
  }
}

export default Route