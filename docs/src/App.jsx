import React, { Component } from 'react'
import Routes from 'ion-router/Routes'
import { connect } from 'react-redux'
import Route from 'ion-router/Route'
import Link from 'ion-router/Link'
import { connectToggle } from 'ion-router/Toggle'
import Menu from 'react-burger-menu/lib/menus/scaleRotate'

import './App.css'
import Examples from './components/Examples'
import MarkdownViewer from './components/MarkdownViewer'
import ExamplesToggle from './toggles/ExamplesToggle'
import * as actions from './redux/actions'
import examples from './examples'

import test from '!!marky!../md/README.md' // eslint-disable-line

connectToggle(connect)
Routes.displayName = 'FancyRoutes'
Link.displayName = 'FancyLink'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = { open: false }
  }

  render() {
    return (
      <div className="App">
        <Menu pageWrapId="page-wrap" outerContainerId="outer-container" isOpen={this.state.open}>
          <Link to="/" className="menu-item" onClick={() => this.setState({ open: false })}>Home</Link>
          <Link route="examples" className="menu-item" onClick={() => this.setState({ open: false })}>Examples</Link>
          <ul>
            {Object.keys(examples).map(example => <li key={example}>
              <Link
                route="examples"
                example={example}
                className="menu-item"
                onClick={() => this.setState({ open: false })}>
                {examples[example].name}
              </Link>
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
                  <MarkdownViewer text={test} />
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
