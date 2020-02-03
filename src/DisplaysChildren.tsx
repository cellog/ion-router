import React from 'react'
import PropTypes from 'prop-types'

export function DisplaysChildren({ children }: { children: React.ReactChild }) {
  return <React.Fragment>{children}</React.Fragment>
}

export default DisplaysChildren

DisplaysChildren.propTypes = {
  children: PropTypes.any,
}
