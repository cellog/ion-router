'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.fake = fake;

var _routeParser = require('route-parser');

var _routeParser2 = _interopRequireDefault(_routeParser);

var _history = require('history');

var _effects = require('redux-saga/effects');

var _actions = require('./actions');

var actions = _interopRequireWildcard(_actions);

var _selectors = require('./selectors');

var selectors = _interopRequireWildcard(_selectors);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function fake() {
  return {};
}

var RouteManager = function () {
  function RouteManager(history, _ref) {
    var name = _ref.name,
        path = _ref.path,
        _ref$paramsFromState = _ref.paramsFromState,
        paramsFromState = _ref$paramsFromState === undefined ? fake : _ref$paramsFromState,
        _ref$stateFromParams = _ref.stateFromParams,
        stateFromParams = _ref$stateFromParams === undefined ? fake : _ref$stateFromParams,
        _ref$updateState = _ref.updateState,
        updateState = _ref$updateState === undefined ? {} : _ref$updateState;

    _classCallCheck(this, RouteManager);

    this.name = name;
    this.path = path;
    this.route = new _routeParser2.default(path);
    this.paramsFromState = paramsFromState;
    this.stateFromParams = stateFromParams;
    this.update = updateState;
    this.history = history;
  }

  _createClass(RouteManager, [{
    key: 'url',
    value: function url(params) {
      return this.route.reverse(params);
    }
  }, {
    key: 'match',
    value: function match(url) {
      return this.route.match(url);
    }
  }, {
    key: 'getState',
    value: function getState(params) {
      return this.stateFromParams(params);
    }
  }, {
    key: 'getParams',
    value: function getParams(state) {
      return this.paramsFromState(state);
    }
  }, {
    key: 'getStateUpdates',
    value: function getStateUpdates(state, params, route) {
      var _this = this;

      var oldState = selectors.oldState(state, route);
      var newState = this.getState(params);
      var changes = RouteManager.changed(oldState, newState);
      return changes.map(function (key) {
        return _this.update[key](newState[key]);
      });
    }
  }, {
    key: 'getUrlUpdate',
    value: function getUrlUpdate(state, route) {
      var oldParams = selectors.oldParams(state, route);
      var newParams = this.getParams(state);
      var changes = RouteManager.changed(oldParams, newParams);
      if (!changes.length) return false;
      return this.url(newParams);
    }
  }, {
    key: 'stateFromLocation',
    value: regeneratorRuntime.mark(function stateFromLocation(location) {
      var state, params, newState, changes, i;
      return regeneratorRuntime.wrap(function stateFromLocation$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return (0, _effects.select)();

            case 2:
              state = _context.sent;
              params = this.match(location.pathname ? (0, _history.createPath)(location) : location);

              if (params) {
                _context.next = 6;
                break;
              }

              return _context.abrupt('return');

            case 6:
              // this url does not match this route
              newState = this.getState(params);
              changes = this.getStateUpdates(state, params, this.name);

              if (!changes.length) {
                _context.next = 19;
                break;
              }

              _context.next = 11;
              return (0, _effects.put)(actions.setParamsAndState(this.name, params, newState));

            case 11:
              i = 0;

            case 12:
              if (!(i < changes.length)) {
                _context.next = 19;
                break;
              }

              if (changes[i].type) changes[i] = [changes[i]];
              _context.next = 16;
              return changes[i].map(function (event) {
                return (0, _effects.put)(event);
              });

            case 16:
              i++;
              _context.next = 12;
              break;

            case 19:
            case 'end':
              return _context.stop();
          }
        }
      }, stateFromLocation, this);
    })
  }, {
    key: 'locationFromState',
    value: regeneratorRuntime.mark(function locationFromState() {
      var state, url, params, newState;
      return regeneratorRuntime.wrap(function locationFromState$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return (0, _effects.select)();

            case 2:
              state = _context2.sent;

              if (selectors.matchedRoute(state, this.name)) {
                _context2.next = 5;
                break;
              }

              return _context2.abrupt('return');

            case 5:
              url = this.getUrlUpdate(state, this.name);

              if (!url) {
                _context2.next = 13;
                break;
              }

              params = this.match(url);
              newState = this.getState(params);
              _context2.next = 11;
              return (0, _effects.put)(actions.setParamsAndState(this.name, params, newState));

            case 11:
              _context2.next = 13;
              return (0, _effects.put)(actions.push(url));

            case 13:
            case 'end':
              return _context2.stop();
          }
        }
      }, locationFromState, this);
    })
  }, {
    key: 'initState',
    value: regeneratorRuntime.mark(function initState() {
      return regeneratorRuntime.wrap(function initState$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return (0, _effects.call)([this, this.stateFromLocation], this.history.location);

            case 2:
            case 'end':
              return _context3.stop();
          }
        }
      }, initState, this);
    })
  }, {
    key: 'monitorState',
    value: regeneratorRuntime.mark(function monitorState() {
      return regeneratorRuntime.wrap(function monitorState$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              if (!true) {
                _context4.next = 7;
                break;
              }

              _context4.next = 3;
              return (0, _effects.take)('*');

            case 3:
              _context4.next = 5;
              return (0, _effects.call)([this, this.locationFromState]);

            case 5:
              _context4.next = 0;
              break;

            case 7:
            case 'end':
              return _context4.stop();
          }
        }
      }, monitorState, this);
    })
  }, {
    key: 'monitorUrl',
    value: regeneratorRuntime.mark(function monitorUrl(location) {
      return regeneratorRuntime.wrap(function monitorUrl$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return (0, _effects.call)([this, this.stateFromLocation], location);

            case 2:
            case 'end':
              return _context5.stop();
          }
        }
      }, monitorUrl, this);
    })
  }], [{
    key: 'changed',
    value: function changed(oldItems, newItems) {
      return Object.keys(newItems).filter(function (key) {
        return !Object.prototype.hasOwnProperty.call(oldItems, key) || oldItems[key] !== newItems[key];
      });
    }
  }]);

  return RouteManager;
}();

exports.default = RouteManager;