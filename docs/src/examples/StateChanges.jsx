import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import Routes from 'ion-router/Routes'
import Route from 'ion-router/Route'

const defaultState = {
  first: '',
  second: 0,
  third: []
}

export const reducer = {
  statechange: (state = defaultState, action) => {
    if (!action || !action.type) return state
    switch (action.type) {
      case 'ONE':
        return {
          ...state,
          first: action.payload
        }
      case 'TWO':
        return {
          ...state,
          second: action.payload
        }
      case 'THREE':
        return {
          ...state,
          third: action.payload
        }
      default:
        return state
    }
  }
}

const removeItem = (arr, idx) => {
  const ret = [...arr]
  ret.splice(idx, 1)
  return ret
}

class StateChanges extends Component {
  constructor(props) {
    super(props)
    this.state = {
      newItem: ''
    }
  }

  render() {
    return (
      <div>
        <p>This demonstration has no links, but updates URL</p>
        <ul>
          <li>
            First state:
            <input
              type="text"
              onChange={e => this.props.setFirst(e.target.value)}
              value={this.props.first}
            />
          </li>
          <li>
            Second state:
            <input
              type="number"
              onChange={e => this.props.setSecond(e.target.value)}
              value={this.props.second}
            />
          </li>
          <li>
            Third state:
            <ul>
              {this.props.third.map((item, i) => (
                <li key={i}>
                  {item}
                  <button
                    onClick={() =>
                      this.props.setThird(
                        removeItem(this.props.third, i)
                      )}
                    title="remove"
                  >X</button>
                </li>
              ))}
            </ul>
            <input
              id="newThird"
              type="text"
              value={this.state.newItem}
              onChange={e => this.setState({ newItem: e.target.value })}
            />
            <button
              disabled={!this.state.newItem.length}
              onClick={() => this.props.setThird([...this.props.third, this.state.newItem])}>
              Add new third item
            </button>
          </li>
        </ul>
        <Routes>
          <Route
            name="home"
            path="/(first/:first/)(second/:second/)(third/*third)"
            stateFromParams={params => ({
              first: params.first || '',
              second: params.second || 0,
              third: params.third ? params.third.split('/') : []
            })}
            paramsFromState={state => ({
              first: state.statechange.first,
              second: state.statechange.second ? state.statechange.second : undefined,
              third: state.statechange.third.join('/')
            })}
            updateState={{
              first: first => ({ type: 'ONE', payload: first }),
              second: second => ({ type: 'TWO', payload: second }),
              third: third => ({ type: 'THREE', payload: third }),
            }}
          />
        </Routes>
      </div>
    )
  }
}

StateChanges.propTypes = {
  first: PropTypes.string.isRequired,
  second: PropTypes.number.isRequired,
  third: PropTypes.array.isRequired,
  setFirst: PropTypes.func.isRequired,
  setSecond: PropTypes.func.isRequired,
  setThird: PropTypes.func.isRequired,
}

export default connect(state => ({
  first: state.statechange.first,
  second: state.statechange.second,
  third: state.statechange.third
}), dispatch => ({
  setFirst: first => dispatch({ type: 'ONE', payload: first }),
  setSecond: second => dispatch({ type: 'TWO', payload: +second }),
  setThird: third => dispatch({ type: 'THREE', payload: third }),
}))(StateChanges)
