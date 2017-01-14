module.exports = function(wallaby) {
  const next = require('postcss-cssnext')
  const modules = require('postcss-modules')
  const postcss = require('postcss')

  const processCss = function(file, done) {
    postcss([
      next,
      modules({
        getJSON: function(filename, json) {
          file.rename(file.path + '.json')
          done(JSON.stringify(json))
        }
      })
    ]).process(file.content, {
      from: file.path,
      to: file.path
    }).catch(function(err) {
      throw err
    })
  }

  return {
    files: [
      'test/test_helper.js',
      { pattern: 'test/**/*.test.js', ignore: true },
      { pattern: 'test/karma/*', ignore: true, instrument: false },
      'src/**/*.js*',
      'src/**/*.css',
      'style/**/*.css',
      { pattern: 'src/.stories/**/*.*', ignore: true, instrument: false },
      { pattern: 'src/index.js', ignore: true, instrument: false },
      { pattern: 'config.js'},
      { pattern: 'config/coaches.js'},
    ],
    filesWithNoCoverageCalculated: ['test/test_helper.js', '*.css'],
    tests: [
      { pattern: 'node_modules/*', ignore: true, instrument: false },
      { pattern: 'test/karma/*', ignore: true, instrument: false },
      'test/**/*.test.js*'
    ],
    preprocessors: {
      'src/**/*.css': processCss,
      'style/**/*.css': processCss
    },
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
      const $ = require('jquery')
      const chaiJquery = require('chai-jquery')
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
      global.$ = $(win)

      propagateToGlobal(win)
      global.window.____isjsdom = true
    },
    //debug: true
  };
};
