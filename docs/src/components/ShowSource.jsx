import React from 'react'
import PropTypes from 'prop-types'
import 'prismjs/themes/prism-coy.css'

function ShowSource({ source }) {
  return (
    <pre>
      <code
        dangerouslySetInnerHTML={{
          __html: source
        }}
      />
    </pre>
  )
}

ShowSource.propTypes = {
  source: PropTypes.string.isRequired
}

export default ShowSource
