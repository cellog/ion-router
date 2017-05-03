import React from 'react'
import { connect } from 'react-redux'
import ExampleToggle from '../toggles/ExampleToggle'
import thing from './Example'

const Example = connect(state => ({
  example: state.examples.example
}), undefined, undefined, { storeKey: 'mainStore' })(thing)

export default function Examples() {
  return (
    <div>
      <ExampleToggle component={Example} />
    </div>
  )
}
