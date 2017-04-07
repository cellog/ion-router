import React, { Children, Component, PropTypes } from 'react'

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
    '@@__routes': PropTypes.object,
    '@@AddRoute': PropTypes.func,
    '@@__isServer': PropTypes.bool,
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
      '@@AddRoute': add,
      parent,
      '@@__routes': routes,
      parentUrl,
      children, // eslint-disable-line no-unused-vars
      ...params
    } = props
    let url = parentUrl
    if (parent && routes && routes[parent]) {
      url = routes[parent].path
    }
    const slash = url && url[url.length - 1] === '/' ? '' : '/'
    const path = url ? `${url}${slash}${params.path}` : params.path
    if (add) add({ ...params, parent, path })
    this.url = path
  }

  render() {
    const { '@@__routes': routes, children } = this.props
    return (<div style={{ display: 'none' }}>
      {children && Children.map(children,
        child => React.cloneElement(child, {
          '@@__routes': routes,
          '@@AddRoute': this.props['@@AddRoute'],
          parentUrl: this.url
        }))}
    </div>)
  }
}

export default Route
