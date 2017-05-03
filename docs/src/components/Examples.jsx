import React from 'react'
import { connect } from 'react-redux'

import ExampleToggle from '../toggles/ExampleToggle'
import { getConnectedLink } from 'ion-router/Link'
import thing from './Example'

const Link = getConnectedLink(connect, 'mainStore')
const Example = connect(state => ({
  example: state.examples.example
}), undefined, undefined, { storeKey: 'mainStore' })(thing)

export default function Examples() {
  return (
    <div>
      <ExampleToggle component={Example} else={() => (
        <div>
          <h1>Examples of ion-router&apos;s power</h1>
          <p>
            There are many ways ion-router can be used, and this
            list will grow as new ones are added.
          </p>
          <ul>
            <li><Link route="examples" example="basic">Basic Example</Link></li>
          </ul>
        </div>
      )}
      />
    </div>
  )
}
