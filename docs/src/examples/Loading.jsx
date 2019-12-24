import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import Routes from 'ion-router/Routes'
import Route from 'ion-router/Route'
import Toggle from 'ion-router/Toggle'

const AsyncToggle = Toggle(() => true, state => {
  return !state.async.loading
})

export const reducer = {
  async: (state = { loading: false, thing: '' }, action) => {
    if (!action || !action.type) return state
    switch (action.type) {
      case 'START_LOAD':
        return {
          ...state,
          loading: true
        }
      case 'SET_THING':
        return {
          ...state,
          loading: false,
          thing: action.payload
        }
      default:
        return state
    }
  }
}

const Thing = connect(state => ({ thing: state.async.thing }))(({ thing }) => (
  <div>This is the loaded thing: {thing}</div>
))

function Loading() {
  return (
    <div style={{ color: 'red' }}>LOADING...</div>
  )
}

function LoadingDemo(props) {
  return (
    <div>
      <p>This example demonstrates using a loading component</p>
      <button onClick={props.load}>Load stuff</button>
      <AsyncToggle component={Thing} loadingComponent={Loading} />
      <Routes>
        <Route path="/" name="home" />
      </Routes>
    </div>
  )
}

LoadingDemo.propTypes = {
  load: PropTypes.func.isRequired
}

export default connect(undefined, dispatch => ({
  load: () => {
    // fake loading from an asychronous source using setTimeout
    dispatch({ type: 'START_LOAD', payload: true })
    setTimeout(() => dispatch({ type: 'SET_THING', payload: '"I loaded the thing!"' }), 1000)
  }
}))(LoadingDemo)
