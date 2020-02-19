import React from 'react'
import PropTypes from 'prop-types'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism'

function ShowSource({ source, lang = "jsx" }) {
  return (
    <SyntaxHighlighter language={lang} style={dark}>
      {source}
    </SyntaxHighlighter>
  )
}

ShowSource.propTypes = {
  source: PropTypes.string.isRequired,
  lang: PropTypes.string
}

export default ShowSource
