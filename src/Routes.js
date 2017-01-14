import React from 'react'
import { connect } from 'react-redux'

function Routes({ dispatch, children }) {
  return <div style={{ display: 'none' }}>
    {children && React.cloneElement(children, { dispatch })}
  </div>
}

export default connect()(Routes)