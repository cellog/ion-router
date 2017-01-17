'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RouteManager = exports.routerReducer = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _actions = require('./actions');

Object.keys(_actions).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _actions[key];
    }
  });
});
exports.getRoutes = getRoutes;
exports.makePath = makePath;
exports.browserActions = browserActions;
exports.makeRoute = makeRoute;
exports.initRoute = initRoute;
exports.listenForRoutes = listenForRoutes;
exports.router = router;

var _effects = require('redux-saga/effects');

var _createBrowserHistory = require('history/createBrowserHistory');

var _createBrowserHistory2 = _interopRequireDefault(_createBrowserHistory);

var _history = require('history');

var _historyChannel = require('./historyChannel');

var _historyChannel2 = _interopRequireDefault(_historyChannel);

var _types = require('./types');

var types = _interopRequireWildcard(_types);

var _reducer = require('./reducer');

var _reducer2 = _interopRequireDefault(_reducer);

var _RouteManager = require('./RouteManager');

var _RouteManager2 = _interopRequireDefault(_RouteManager);

var actions = _interopRequireWildcard(_actions);

var _selectors = require('./selectors');

var selectors = _interopRequireWildcard(_selectors);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var _marked = [browserActions, initRoute, listenForRoutes, router].map(regeneratorRuntime.mark);

var routes = {};

function getRoutes() {
  return _extends({}, routes);
}

function makePath(name, params) {
  return routes[name].url(params);
}

exports.routerReducer = _reducer2.default;
exports.RouteManager = _RouteManager2.default;
function browserActions(history) {
  var action;
  return regeneratorRuntime.wrap(function browserActions$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (!true) {
            _context.next = 8;
            break;
          }

          _context.next = 3;
          return (0, _effects.take)(types.ACTION);

        case 3:
          action = _context.sent;
          _context.next = 6;
          return (0, _effects.call)([history, history[action.payload.verb]], action.payload.route);

        case 6:
          _context.next = 0;
          break;

        case 8:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked[0], this);
}

function makeRoute(history, route) {
  routes[route.name] = new _RouteManager2.default(history, route);
}

function initRoute(history, params) {
  var location, matched, matchedRoutes;
  return regeneratorRuntime.wrap(function initRoute$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          makeRoute(history, params);
          _context2.next = 3;
          return (0, _effects.put)(actions.addRoute(params.name, params.path));

        case 3:
          _context2.next = 5;
          return (0, _effects.call)([routes[params.name], routes[params.name].initState]);

        case 5:
          _context2.next = 7;
          return (0, _effects.fork)([routes[params.name], routes[params.name].monitorState]);

        case 7:
          location = (0, _history.createPath)(history.location);
          matched = routes[params.name].match(location);

          if (!matched) {
            _context2.next = 15;
            break;
          }

          _context2.next = 12;
          return (0, _effects.select)(selectors.matchedRoutes);

        case 12:
          matchedRoutes = _context2.sent;
          _context2.next = 15;
          return (0, _effects.put)(actions.matchRoutes([].concat(_toConsumableArray(matchedRoutes), [params.name])));

        case 15:
        case 'end':
          return _context2.stop();
      }
    }
  }, _marked[1], this);
}

function listenForRoutes(history) {
  var params;
  return regeneratorRuntime.wrap(function listenForRoutes$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          if (!true) {
            _context3.next = 8;
            break;
          }

          _context3.next = 3;
          return (0, _effects.take)(types.CREATE_ROUTE);

        case 3:
          params = _context3.sent;
          _context3.next = 6;
          return (0, _effects.call)(initRoute, history, params.payload);

        case 6:
          _context3.next = 0;
          break;

        case 8:
        case 'end':
          return _context3.stop();
      }
    }
  }, _marked[2], this);
}

function router(routeDefinitions, history, channel) {
  var _this = this;

  var browserTask, location, i, _loop;

  return regeneratorRuntime.wrap(function router$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return (0, _effects.put)(actions.route(history.location));

        case 2:
          _context5.next = 4;
          return (0, _effects.fork)(browserActions, history);

        case 4:
          browserTask = _context5.sent;
          location = (0, _history.createPath)(history.location);
          i = 0;

        case 7:
          if (!(i < routeDefinitions.length)) {
            _context5.next = 12;
            break;
          }

          return _context5.delegateYield(initRoute(history, routeDefinitions[i]), 't0', 9);

        case 9:
          i++;
          _context5.next = 7;
          break;

        case 12:
          _context5.prev = 12;
          _loop = regeneratorRuntime.mark(function _loop() {
            var locationChange, path, keys, matchedRoutes;
            return regeneratorRuntime.wrap(function _loop$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    _context4.next = 2;
                    return (0, _effects.take)(channel);

                  case 2:
                    locationChange = _context4.sent;
                    path = (0, _history.createPath)(locationChange.location);

                    if (!(location !== path)) {
                      _context4.next = 14;
                      break;
                    }

                    keys = Object.keys(routes);

                    location = path;
                    matchedRoutes = keys.filter(function (name) {
                      return routes[name].match(path);
                    });
                    _context4.next = 10;
                    return (0, _effects.put)(actions.matchRoutes(matchedRoutes));

                  case 10:
                    _context4.next = 12;
                    return (0, _effects.put)(actions.route(locationChange.location));

                  case 12:
                    _context4.next = 14;
                    return keys.map(function (name) {
                      return (0, _effects.call)([routes[name], routes[name].monitorUrl], locationChange.location);
                    });

                  case 14:
                  case 'end':
                    return _context4.stop();
                }
              }
            }, _loop, _this);
          });

        case 14:
          if (!true) {
            _context5.next = 18;
            break;
          }

          return _context5.delegateYield(_loop(), 't1', 16);

        case 16:
          _context5.next = 14;
          break;

        case 18:
          _context5.prev = 18;
          _context5.next = 21;
          return (0, _effects.cancel)(browserTask);

        case 21:
          channel.close();
          return _context5.finish(18);

        case 23:
        case 'end':
          return _context5.stop();
      }
    }
  }, _marked[3], this, [[12,, 18, 23]]);
}

exports.default = function (sagaMiddleware, routeDefinitions) {
  var history = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : (0, _createBrowserHistory2.default)();
  var channel = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : (0, _historyChannel2.default)(history);

  sagaMiddleware.run(router, routeDefinitions, history, channel);
};