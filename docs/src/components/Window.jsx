import React from 'react'
import { render } from 'react-dom'

export default function Window({
  element,
}) {
  const node = React.useRef(null)
  const setNode = React.useCallback(ref => {
    if (ref) {
      render(element, ref)
      node.current = ref
    }
  })
  return (
    <div ref={setNode} />
  )
}
