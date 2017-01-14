/* eslint no-var: 0, babel/object-shorthand: 0, vars-on-top: 0 */
require('babel-register')
var karma = require('../../karma-common.conf.js')

module.exports = function (config) {
  return karma(config, {
    browsers: ['Chrome', 'Safari', 'Firefox'],
    singleRun: false,
    concurrency: 3
  })
}
