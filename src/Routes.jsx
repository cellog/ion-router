import React, { PropTypes } from 'react'

export function RawRoutes({ dispatch, children }) {
  return (<div style={{ display: 'none' }}>
    {children && React.cloneElement(children, { dispatch })}
  </div>)
}

RawRoutes.propTypes = {
  dispatch: PropTypes.func,
  children: PropTypes.any
}


export const Placeholder = () => {
  throw new Error('call connectRoutes with the connect function from react-redux to ' +
    'initialize Routes (see https://github.com/cellog/react-redux-saga-router/issues/1)')
}

let ConnectedRoutes = null

export function connectRoutes(connect) {
  ConnectedRoutes = connect()(RawRoutes)
}

const ConnectRoutes = props => (ConnectedRoutes ? <ConnectedRoutes {...props} /> : <Placeholder />)

export default ConnectRoutes
