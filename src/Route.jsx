import React, { Children, Component } from 'react'
import PropTypes from 'prop-types'
import Context from './Context'

export function fake() {
  return {}
}

class Route extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    paramsFromState: PropTypes.func,
    stateFromParams: PropTypes.func,
    __routeInfo: PropTypes.object,
    updateState: PropTypes.object,
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
    const {
      parent,
      parentUrl,
      __routeInfo: info,
      children: unused, // eslint-disable-line
      ...params
    } = props
    let url = parentUrl
    if (parent && info.routes && info.routes[parent]) {
      url = info.routes[parent].path
    }
    const slash = url && url[url.length - 1] === '/' ? '' : '/'
    const path = url ? `${url}${slash}${params.path}` : params.path
    info.addRoute({ ...params, parent, path })
    this.url = path
  }

  render() {
    const { children } = this.props
    return (<div style={{ display: 'none' }}>
      {children && Children.map(children,
        child => React.cloneElement(child, {
          parentUrl: this.url
        }))}
    </div>)
  }
}

const ContextRoute = props => (
  <Context.Consumer>
    {info => <Route {...props} __routeInfo={info} />}
  </Context.Consumer>
)

export default ContextRoute