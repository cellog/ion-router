import React, { useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { createMemoryHistory } from 'history'
import { createStore, combineReducers, compose } from 'redux'
import { connect, Provider } from 'react-redux'
import makeRouter, { makeRouterStoreEnhancer } from 'ion-router'
import Routes from 'ion-router/Routes'
import routing from 'ion-router/reducer'

import Browser from './Browser'
import ShowSource from './ShowSource'
import examples from '../examples'
import Window from './Window'

function Example({ example }) {
  const init = () => {
    const history = createMemoryHistory({
      initialEntries: ['/']
    })
    const reducer = combineReducers({
      ...examples[example].reducer,
      routing
    })

    // set up the router and create the store
    const enhancer = makeRouterStoreEnhancer(history)

    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? // eslint-disable-line
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ name: `examples: ${example}` }) // eslint-disable-line
      : compose
    const newStore = createStore(reducer, undefined,
      composeEnhancers(enhancer))
    makeRouter(connect, newStore)
    return newStore
  }
  const store = useRef(init())
  store.current = init()
  const [showBrowser, setShowBrowser] = useState(true)

  console.log(store.current.getState())
  return <Window element={
    <div className="example">
      <div className="browser-panel">
        <Provider store={store.current}>
          <Routes store={store.current}>
          {showBrowser ?
            <Browser
              store={store.current}
              Content={examples[example].component}
              showSource={() => setShowBrowser(false)}
            /> : <div /> }
          </Routes>
        </Provider>
      </div>
      <div className="source-panel">
        <button className="mobile-showsource" onClick={() => setShowBrowser(true)}>Show Example</button>
        <ShowSource source={examples[example].source} />
      </div>
    </div>
  } />
}

Example.propTypes = {
  example: PropTypes.string
}

export default Example
