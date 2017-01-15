import React from 'react'
import Routes from '../src/Routes'
import { renderComponent } from './test_helper'

describe('react-redux-saga-router Routes', () => {
  let component, store, log // eslint-disable-line
  function make(props = {}, Comp = Routes) {
    const info = renderComponent(Comp, props, {}, true)
    component = info[0]
    store = info[1]
    log = info[2]
  }

  it('passes in dispatch prop', () => {
    const Thing = ({ dispatch }) => { // eslint-disable-line
      expect(dispatch).is.instanceof(Function)
      return <div onClick={() => dispatch({ type: 'foo', payload: 'bar' })}>hi</div> // eslint-disable-line
    }
    const R = () => <Routes>
      <Thing />
    </Routes>
    make({}, R)
    component.find('div').trigger('click')
    expect(log).eqls([
      { type: 'foo', payload: 'bar' }
    ])
  })
})
