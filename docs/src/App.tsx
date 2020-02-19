import React, { useState } from 'react'
import { Routes, Route, Link } from 'ion-router'
import { scaleRotate as Menu } from 'react-burger-menu'
import marked from 'marked'
import raw from 'raw.macro'

import './App.css'
import Examples from './components/Examples'
import MarkdownViewer from './components/MarkdownViewer'
import ExamplesToggle from './toggles/ExamplesToggle'
import * as actions from './redux/actions'
import examples from './examples'

const test = marked(raw('../md/README.md'))
;(Routes as React.FC).displayName = 'FancyRoutes'
;(Link as React.FC).displayName = 'FancyLink'

function App() {
  const [open, setMenuOpen] = useState(false)
  return (
    <div className="App">
      <Menu
        pageWrapId="page-wrap"
        outerContainerId="outer-container"
        isOpen={open}
        onStateChange={({ isOpen }) => setMenuOpen(isOpen)}
      >
        <Link to="/" className="menu-item" onClick={() => setMenuOpen(false)}>
          Home
        </Link>
        <Link
          route="examples"
          className="menu-item"
          onClick={() => setMenuOpen(false)}
        >
          Examples
        </Link>
        <ul>
          {Object.keys(examples).map(example => (
            <li key={example}>
              <Link
                route="examples"
                example={example}
                className="menu-item"
                onClick={() => setMenuOpen(false)}
              >
                {examples[example].name}
              </Link>
            </li>
          ))}
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
              else={() => <MarkdownViewer text={test} />}
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
              example: name => actions.chooseExample(name),
            }}
          />
        </Route>
      </Routes>
    </div>
  )
}

export default App
