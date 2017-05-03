import React from 'react'
import PropTypes from 'prop-types'
import * as actions from 'ion-router/actions'
import { createPath } from 'history'
import { connect } from 'react-redux'
import 'font-awesome/css/font-awesome.min.css'

import '../App.css'

const Browser = ({ url = '/', back, forward, reset, showSource, Content = () => <div>hi</div> }) => (
  <div className="browser">
    <header>
      <button onClick={back} className="back"><span className="fa fa-chevron-left" /></button>
      <button onClick={forward} className="forward"><span className="fa fa-chevron-right" /></button>
      <button onClick={reset} className="refresh"><span className="fa fa-refresh" /></button>
      <input type="text" value={url} readOnly />
      <button onClick={showSource} className="mobile-showsource">View Source</button>
    </header>
    <article>
      <Content />
    </article>
  </div>
)


Browser.propTypes = {
  url: PropTypes.string.isRequired,
  back: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  forward: PropTypes.func.isRequired,
  showSource: PropTypes.func.isRequired,
  Content: PropTypes.any,
}

export default connect(state => ({
  url: createPath(state.routing.location),
}), dispatch => ({
  back: () => dispatch(actions.goBack()),
  forward: () => dispatch(actions.goForward()),
  reset: () => dispatch(actions.push('/')),
}))(Browser)
