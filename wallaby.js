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
        babel: require('@babel/core'),
        presets: ["@babel/preset-react", ["@babel/env", {
          targets: {
            edge: "17",
            firefox: "60",
            chrome: "67",
            safari: "11.1"
          },
          useBuiltIns: "usage"
        }]],
        plugins: ["@babel/plugin-proposal-class-properties", "@babel/plugin-proposal-export-default-from"],
      }),
    },
    env: {
      type: 'node'
    },
    testFramework: 'jest'
    // debug: true
  }
}
