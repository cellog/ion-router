'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _reduxSaga = require('redux-saga');

exports.default = function (history) {
  return (0, _reduxSaga.eventChannel)(function (emit) {
    var unlisten = history.listen(function (location, action) {
      return emit({ location: location, action: action });
    });
    return function () {
      return unlisten();
    };
  });
};

module.exports = exports['default'];