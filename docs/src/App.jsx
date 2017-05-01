import React, { Component } from 'react'
import Routes from 'ion-router/Routes'
import Route from 'ion-router/Route'
import Link from 'ion-router/Link'

import './App.css'
import Examples from './components/Examples'
import ExamplesToggle from './toggles/ExamplesToggle'
import * as actions from './redux/actions'

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Welcome</h2>
        </div>
        <div className="App-intro">
          <ul>
            <li><Link route="examples">Examples</Link></li>
          </ul>
          <ExamplesToggle component={Examples} />
        </div>
        <Routes>
          <Route name="home" path="/">
            <Route
              name="examples"
              path="examples(/:example)"
              stateFromParams={params => params}
              paramsFromState={state => state}
              updateState={{
                example: name => actions.chooseExample(name)
              }}
            />
          </Route>
        </Routes>
      </div>
    )
  }
}

export default App;
