import React, { Component, Children } from 'react'
import { Context } from 'react-redux'
import PropTypes from 'prop-types'

const SubContext = React.createContext()

export class IfOuter extends Component {
  static defaultProps = {
    loadedSelector: () => true,
    delayMs: 0
  }

  constructor(props) {
    super(props)
    this.state = {
      waiting: [],
      loading: false,
      error: false,
      timeout: () => {},
      value: {
        selector: props.selector,
        loadedSelector: props.loadedSelector
      }
    }
    this.filterKids = type => Children.toArray(this.props.children.props.children).filter(el => el.type === type)
  }

  componentDidUpdate(lastProps) {
    if (lastProps.selector !== this.props.selector || lastProps.loadedSelector !== this.props.loadedSelector) {
      this.setState({
        value: {
          selector: this.props.selector,
          loadedSelector: this.props.loadedSelector
        }
      })
    }
  }

  componentDidCatch(error, info) {
    if (error.redux && error.then instanceof Function) {
      let loading = false
      if (error.loading) {
        if (error.timeout) {
          console.log(error)
          this.setState({
            timeout: setTimeout(() => this.setState({ loading: true, timeout: () => {} }), error.timeout)
          })
        } else {
          loading = true
        }
      }
      error.then(() => {
        info.resolved = true
        this.setState(state => {
          if (state.waiting.indexOf(error) === -1) return
          const waiting = [...state.waiting]
          waiting.splice(waiting.indexOf(error), 1)
          this.state.timeout()
          if (error.loading) {
            loading = false
          }
          return { waiting, loading, timeout: () => {} }
        })
      })
      .catch(error => {
        this.setState({ error })
      })
      // selector did not match
      this.setState(state => ({
        waiting: [...state.waiting, error],
        loading
      }))
    } else {
      throw error
    }
  }

  render() {
    if (this.state.error) {
      throw this.state.error
    }
    if (this.state.waiting.length) {
      if (this.state.loading) {
        const loadingKids = this.filterKids(Loading)
        if (loadingKids.length) {
          return (
            <SubContext.Provider value={this.state.value}>
              {loadingKids}
            </SubContext.Provider>
          )
        }
      }
      const selectKids = this.filterKids(Else)
      if (selectKids.length) {
        return (
          <SubContext.Provider value={this.state.value}>
            {selectKids}
          </SubContext.Provider>
        )
      }
      return null
    }
    return (
      <SubContext.Provider value={this.state.value}>
        {this.props.children}
      </SubContext.Provider>
    )
  }
}

export class ReduxSelect extends Component {
  constructor(props) {
    super(props)
    this.renderChildren = this.renderChildren.bind(this)
    this.state = {
      selector: props.selector,
      loadedSelector: props.loadedSelector
    }
  }

  componentDidUpdate(lastProps) {
    if (lastProps.selector !== this.props.selector || lastProps.loadedSelector !== this.props.loadedSelector) {
      this.setState({
        selector: this.props.selector,
        loadedSelector: this.props.loadedSelector
      })
    }
  }

  renderChildren({ state, store }) {
    const { selector, loadedSelector, loadingDelayMs } = this.props
    const loaded = loadedSelector(state)
    if (!loaded || !selector(state)) {
      if (!loaded) {
        const promise = new Promise((resolve) => {
          const unsubscribe = store.subscribe(() => {
            if (loadedSelector(store.getState())) {
              resolve()
              unsubscribe()
            }
          })
        })
        promise.redux = true
        promise.loading = true
        if (loadingDelayMs) {
          promise.timeout = this.props.loadingDelayMs
        }
        promise.suppressReactErrorLogging = true
        throw promise
      }
      const promise = new Promise((resolve) => {
        const unsubscribe = store.subscribe(() => {
          if (selector(store.getState())) {
            resolve()
            unsubscribe()
          }
        })
      })
      console.log(this.props.name)
      promise.redux = true
      promise.suppressReactErrorLogging = true
      throw promise
    }
    return this.props.children
  }

  render() {
    return (
      <Context.Consumer>
        {this.renderChildren}
      </Context.Consumer>
    )
  }
}

export function If({ children, selector, loadedSelector = () => true, loadingDelayMs = 0 }) {
  return (
    <IfOuter name="If" selector={selector} loadedSelector={loadedSelector}>
      <ReduxSelect selector={selector} loadedSelector={loadedSelector} loadingDelayMs={loadingDelayMs} name="If">
        {children}
      </ReduxSelect>
    </IfOuter>
  )
}

export function Else({ children }) {
  return (
    <SubContext.Consumer>
      {({ selector, loadedSelector }) => {
        console.log(selector, loadedSelector)
        return <IfOuter name="Else" selector={selector} loadedSelector={loadedSelector}>
          <ReduxSelect selector={state => !selector(state)} loadedSelector={loadedSelector} name="Else">
            {children}
          </ReduxSelect>
        </IfOuter>}}
    </SubContext.Consumer>
  )
}

export function Loading({ children }) {
  return (
    <SubContext.Consumer>
      {({ loadedSelector }) => {
        const loading = state => !loadedSelector(state)
        return <IfOuter name="Loading" selector={loading} loadedSelector={() => true}>
          <ReduxSelect selector={loading} loadedSelector={() => true} name="Loading">
            {children}
          </ReduxSelect>
        </IfOuter>}}
    </SubContext.Consumer>
  )
}

If.propTypes = {
  selector: PropTypes.func.isRequired,
  children: PropTypes.any
}

Else.propTypes = {
  children: PropTypes.any
}
