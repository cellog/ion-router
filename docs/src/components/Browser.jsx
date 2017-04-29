import React from 'react'
import PropTypes from 'prop-types'
import * as actions from 'ion-router/actions'
import { createPath } from 'history'
import { connect } from 'react-redux'
import '../App.css'

const Browser = ({ url = '/', back, forward, Content = () => <div>hi</div> }) => (
  <div className="browser">
    <header>
      <button onClick={back} className="back">&lt;&lt;</button>
      <button onClick={forward} className="forward">&gt;&gt;</button>
      <input type="text" value={url} readOnly />
    </header>
    <article>
      <Content />
    </article>
  </div>
)


Browser.propTypes = {
  url: PropTypes.string.isRequired,
  back: PropTypes.func.isRequired,
  forward: PropTypes.func.isRequired,
  Content: PropTypes.any,
}

export default connect(state => ({
  url: createPath(state.routing.location),
}), dispatch => ({
  back: () => dispatch(actions.goBack()),
  forward: () => dispatch(actions.goForward())
}))(Browser)
