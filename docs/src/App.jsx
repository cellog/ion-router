import React, { Component } from 'react'
import Routes from 'ion-router/Routes'
import Route from 'ion-router/Route'
import Link from 'ion-router/Link'
import Menu from 'react-burger-menu/lib/menus/scaleRotate'

import './App.css'
import Examples from './components/Examples'
import Example from './components/Example'
import ExamplesToggle from './toggles/ExamplesToggle'
import * as actions from './redux/actions'
import examples from './examples'

class App extends Component {
  render() {
    return (
      <div className="App">
        <Menu pageWrapId="page-wrap" outerContainerId="outer-container">
          <Link to="/" className="menu-item">Home</Link>
          <Link route="examples" className="menu-item">Examples</Link>
          <ul>
            {Object.keys(examples).map(example => <li key={example}>
              <Link route="examples" example={example} className="menu-item">{example}</Link>
            </li>)}
          </ul>
        </Menu>
        <div id="outer-container">
          <div id="page-wrap">
            <div className="App-header">
              <h2>ion-router</h2>
            </div>
            <div className="App-intro">
              <ExamplesToggle
                component={Examples}
                else={() => (
                  <Example example="basic" />
                )}
              />
            </div>
          </div>
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
