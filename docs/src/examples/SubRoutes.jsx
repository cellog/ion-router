import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import Routes from 'ion-router/Routes'
import Route from 'ion-router/Route'
import RouteToggle from 'ion-router/RouteToggle'
import Link from 'ion-router/Link'

export const reducer = {
  subroutes: (state = false, action) => {
    if (!action || !action.type) return state
    if (action.type === 'SUBROUTE') {
      return action.payload
    }
    return state
  }
}

const ThingToggle = RouteToggle('things')
const SubthingToggle = RouteToggle('subthing-things')

const Null = ({ load }) => <div>
  <ThingToggle
    component={() => (
      <button onClick={load}>Load sub-routes</button>
    )}
    else={() => (
      <Link route="things">Click here first</Link>
    )}
  />
</div>

Null.propTypes = {
  load: PropTypes.func.isRequired
}

function Subthings({ parentRoute, unload }) {
  return (
    <div>
      <p>This is the loaded child</p>
      <button onClick={unload}>Unload child route</button>
      <Link route={`subthing-${parentRoute}`}>Show new dynamic route</Link>
      <SubthingToggle
        component={() => (
          <div>
            This is the subroute dynamic route
          </div>
        )}
      />
      <Routes>
        <Route path="subthing" parent={parentRoute} name={`subthing-${parentRoute}`} />
      </Routes>
    </div>
  )
}

Subthings.propTypes = {
  parentRoute: PropTypes.string.isRequired,
  unload: PropTypes.func.isRequired
}


function SubRoutes({ load, subthings, routes, unload }) {
  const Sub = subthings
  return (
    <div>
      <p>This example demonstrates asynchronous loading of a sub-module with dynamic routes</p>
      <p>Declared routes:</p>
      <ul>
        {routes.map(route => <li key={route}>{route}</li>)}
      </ul>

      <Sub parentRoute="things" unload={unload} load={load} />
      <Routes>
        <Route path="/" name="home" />
        <Route path="/things" name="things" />
      </Routes>
    </div>
  )
}

SubRoutes.propTypes = {
  load: PropTypes.func.isRequired,
  unload: PropTypes.func.isRequired,
  subthings: PropTypes.any.isRequired,
  routes: PropTypes.array.isRequired,
}

export default connect(state => ({
  subthings: state.subroutes ? Subthings : Null,
  routes: state.routing.routes.ids.map(id => `${id} (${state.routing.routes.routes[id].path})`)
}), dispatch => ({
  load: () => dispatch({ type: 'SUBROUTE', payload: true }),
  unload: () => dispatch({ type: 'SUBROUTE', payload: false }),
}))(SubRoutes)
