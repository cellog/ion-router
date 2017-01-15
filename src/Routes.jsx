import React, { PropTypes } from 'react'
import { connect } from 'react-redux'

function Routes({ dispatch, children }) {
  return (<div style={{ display: 'none' }}>
    {children && React.cloneElement(children, { dispatch })}
  </div>)
}

Routes.propTypes = {
  dispatch: PropTypes.func,
  children: PropTypes.any
}

export default connect()(Routes)
