/* eslint no-var: 0, babel/object-shorthand: 0, vars-on-top: 0 */
require('babel-register')
var karma = require('../../karma-common.conf.js')
var browsers = require('./chrome50osx.js')

module.exports = function (config) {
  return karma(config, {
    customLaunchers: browsers,
    browsers: Object.keys(browsers)
  })
}
