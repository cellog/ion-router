module.exports = function(wallaby) {
  return {
    files: [
      'test/test_helper.jsx',
      { pattern: 'test/**/*.test.js', ignore: true },
      { pattern: 'test/karma/*', ignore: true, instrument: false },
      'src/**/*.js*',
    ],
    filesWithNoCoverageCalculated: ['test/test_helper.jsx'],
    tests: [
      { pattern: 'node_modules/*', ignore: true, instrument: false },
      { pattern: 'test/karma/*', ignore: true, instrument: false },
      'test/**/*.test.js*'
    ],
    compilers: {
      '**/*.js?(x)': wallaby.compilers.babel({
        babel: require('babel-core'),
        presets: ['es2015', 'stage-0', 'react']
      }),
    },
    env: {
      type: 'node'
    },
    testFramework: 'mocha',
    setup: function() {
      const jsdom = require('jsdom').jsdom
      const sinon = require('sinon')
      const chai = require('chai')
      const expect = chai.expect
      require('babel-polyfill')

// from mocha-jsdom https://github.com/rstacruz/mocha-jsdom/blob/master/index.js#L80
      const propagateToGlobal = (window) => {
        for (var key in window) {
          if (!window.hasOwnProperty(key)) continue
          if (key in global) continue

          global[key] = window[key]
        }
      }

// setup the simplest document possible
      const doc = jsdom('')
      const win = doc.defaultView
      global.document = doc
      global.window = win
      global.sinon = sinon
      global.expect = expect
      global.chai = chai

      propagateToGlobal(win)
      global.window.____isjsdom = true
    },
    //debug: true
  };
};
