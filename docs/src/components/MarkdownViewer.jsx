import React from 'react'
import PropTypes from 'prop-types'

export default function Viewer({ text }) {
  const danger = { __html: text }
  return (
    <div className="markdown-viewer">
      <div dangerouslySetInnerHTML={danger} />
    </div>
  )
}

Viewer.propTypes = {
  text: PropTypes.string.isRequired
}
