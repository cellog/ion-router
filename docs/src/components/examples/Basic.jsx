import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import Routes from 'ion-router/Routes'
import Route from 'ion-router/Route'
import Toggle from 'ion-router/Toggle'
import RouteToggle from 'ion-router/RouteToggle'
import Link from 'ion-router/Link'

const HomeToggle = RouteToggle('home')
const HiToggle = RouteToggle('hi')
const HiThereToggle = RouteToggle('hithere')
const ThereToggle = Toggle(state => state.there === 'Greg')

export const reducer = {
  there: (state = '', action) => {
    if (!action || !action.type) return state
    if (action.type === 'UPDATE_THERE') return action.payload
    return state
  }
}

function Basic(props) {
  return (
    <div>
      <Routes>
        <Route path="/" name="home" />
        <Route path="/hi" name="hi" />
        <Route
          path="/hi/:there"
          name="hithere"
          stateFromParams={params => params}
          paramsFromState={state => state}
          updateState={{
            there: t => ({ type: 'UPDATE_THERE', payload: t })
          }}
        />
      </Routes>
      <ul>
        <li><Link route="home">Home</Link></li>
        <li><Link route="hi">Hi</Link></li>
        <li><Link route="hithere" there="Somebody">Hi to Somebody</Link></li>
        <li><Link route="hithere" there="Greg">Hi to Greg</Link></li>
      </ul>
      <HomeToggle
        component={() => (
          <div>
            Home
          </div>
        )}
      />
      <HiToggle
        component={() => (
          <div>
            Hi
          </div>
        )}
      />
      <HiThereToggle
        component={() => (
          <div>
            Hi {props.there}!
            <ThereToggle
              component={() => (
                <div>It&apos;s Greg!!</div>
              )}
            />
          </div>
        )}
      />
    </div>
  )
}

Basic.propTypes = {
  there: PropTypes.string
}

export default connect(state => state)(Basic)
