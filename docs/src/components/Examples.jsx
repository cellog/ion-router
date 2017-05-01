import React from 'react'
import { connect } from 'react-redux'
import Link from 'ion-router/Link'
import ExampleToggle from '../toggles/ExampleToggle'
import thing from './Example'

const Example = connect(state => ({
  example: state.examples.example
}))(thing)

export default function Examples() {
  return (
    <div>
      <ul>
        <li><Link route="examples" example="basic">Basic</Link></li>
      </ul>
      <ExampleToggle component={Example} />
    </div>
  )
}
