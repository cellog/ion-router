import React, { PureComponent, useRef } from 'react'
import PropTypes from 'prop-types'

import DisplaysChildren from './DisplaysChildren'

interface NullComponentProps {
  '@@__loaded': boolean
  '@@__isActive': boolean
}
export default function NullComponent<WrapperProps extends {}>(
  Loading: React.FC,
  Component: React.FC,
  ElseComponent: React.FC,
  Wrapper: React.FC<WrapperProps>,
  wrapperProps: WrapperProps,
  debug: boolean,
  cons: typeof window['console'] = console
) {
  const Toggle = (props: NullComponentProps) => {
    const rendered = useRef(0)
    rendered.current++

    const {
      '@@__loaded': loadedProp,
      '@@__isActive': activeProp,
      ...nullProps
    } = props
    if (debug) {
      cons.log(`Toggle: loaded: ${loadedProp}, active: ${activeProp}`)
      cons.log(
        'Loading component',
        Loading,
        'Component',
        Component,
        'Else',
        ElseComponent
      )
    }
    if (Wrapper === ((DisplaysChildren as unknown) as React.FC<WrapperProps>)) {
      return !loadedProp ? (
        <Loading {...nullProps} />
      ) : activeProp ? (
        <Component {...nullProps} />
      ) : (
        <ElseComponent {...nullProps} />
      )
    }
    return (
      <Wrapper {...wrapperProps}>
        {!loadedProp ? (
          <Loading {...nullProps} key="loading" />
        ) : activeProp ? (
          <Component {...nullProps} key="component" />
        ) : (
          <ElseComponent {...nullProps} key="else" />
        )}
      </Wrapper>
    )
  }

  Toggle.propTypes = {
    '@@__loaded': PropTypes.bool,
    '@@__isActive': PropTypes.bool,
  }

  return React.memo(Toggle)
}
