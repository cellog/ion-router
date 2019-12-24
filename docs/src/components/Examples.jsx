import React from 'react'
import { connect } from 'react-redux'

import ExampleToggle from '../toggles/ExampleToggle'
import Link from 'ion-router/Link'
import Example from './Example'

const ConnectedExample = connect(state => ({
  example: state.examples.example
}))(Example)

export default function Examples() {
  return (
    <div>
      <ExampleToggle component={ConnectedExample} else={() => (
        <div>
          <h1>Examples of ion-router&apos;s power</h1>
          <p>
            There are many ways ion-router can be used, and this
            list will grow as new ones are added.
          </p>
          <ul>
            <li><Link route="examples" example="basic">Basic Example</Link></li>
            <li><Link route="examples" example="loading">Asynchronous loading</Link></li>
            <li><Link route="examples" example="subroutes">Dynamic sub-routes</Link></li>
            <li><Link route="examples" example="statechanges">Updating url from only redux state changes</Link></li>
          </ul>
        </div>
      )}
      />
    </div>
  )
}
