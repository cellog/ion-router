import React from 'react'
import PropTypes from 'prop-types'

export default function DisplaysChildren({ children }) {
  return <React.Fragment>{children}</React.Fragment>
}

DisplaysChildren.propTypes = {
  children: PropTypes.any,
}
