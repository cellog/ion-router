import React, { Component } from 'react'
import './App.css'
import Example from './components/Example'

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Welcome</h2>
        </div>
        <div className="App-intro">
          <Example example="basic" />
        </div>
      </div>
    );
  }
}

export default App;
