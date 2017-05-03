import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import Routes from 'ion-router/Routes'
import Route from 'ion-router/Route'
import Toggle from 'ion-router/Toggle'
import RouteToggle from 'ion-router/RouteToggle'
import Link from 'ion-router/Link'

const HiThereToggle = RouteToggle('hithere')
const ThereToggle = Toggle(state => state.there === 'Greg')

export const reducer = {
  there: (state = '', action) => {
    if (!action || !action.type) return state
    if (action.type === 'UPDATE_THERE') return action.payload || ''
    return state
  }
}

function Basic(props) {
  return (
    <div>
      <p>
        This simple example demonstrates using <code>Link</code>,
        <code>Routes</code>, <code>Route</code>, and two toggles,
        <code>RouteToggle</code> and <code>Toggle</code>.
      </p>
      <ul>
        <li><Link route="home">Home</Link></li>
        <li>
          <Link route="hithere" there="Somebody">Hi to Somebody</Link>
        </li>
        <li><Link route="hithere" there="Greg">Hi to Greg</Link></li>
        <li>
          Change value of <code>there</code> in store:
          <input value={props.there} onChange={e => props.change(e.target.value)} />
        </li>
      </ul>
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
        else={() => (
          <div>
            Home
          </div>
        )}
      />
      <Routes>
        <Route path="/" name="home" />
        <Route
          path="/hi(/:there)"
          name="hithere"
          stateFromParams={params => params}
          paramsFromState={state => state}
          updateState={{
            there: t => ({ type: 'UPDATE_THERE', payload: t })
          }}
        />
      </Routes>
    </div>
  )
}

Basic.propTypes = {
  there: PropTypes.string
}

export default connect(state => state, dispatch => ({
  change: there => dispatch({ type: 'UPDATE_THERE', payload: there })
}))(Basic)
