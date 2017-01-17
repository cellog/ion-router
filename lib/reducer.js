'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _types = require('./types');

var types = _interopRequireWildcard(_types);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var defaultState = {
  location: {
    pathname: '',
    search: '',
    hash: ''
  },
  matchedRoutes: [],
  routes: {
    ids: [],
    routes: {}
  }
};

exports.default = function () {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultState;
  var action = arguments[1];

  if (!action || !action.type) return state;
  var route = void 0;
  var name = void 0;
  var ids = void 0;
  var routes = void 0;
  switch (action.type) {
    case types.ROUTE:
      if (action.payload.pathname === state.location.pathname && action.payload.search === state.location.search && action.payload.hash === state.location.hash) return state;
      return _extends({}, state, {
        location: _extends({}, action.payload)
      });
    case types.SET_PARAMS:
      return _extends({}, state, {
        routes: _extends({}, state.routes, {
          routes: _extends({}, state.routes.routes, _defineProperty({}, action.payload.route, _extends({}, state.routes.routes[action.payload.route], {
            params: action.payload.params,
            state: action.payload.state
          })))
        })
      });
    case types.MATCH_ROUTES:
      return _extends({}, state, {
        matchedRoutes: action.payload
      });
    case types.EDIT_ROUTE:
      route = action.payload;
      return _extends({}, state, {
        routes: {
          ids: [].concat(_toConsumableArray(state.routes.ids), [route.name]),
          routes: _extends({}, state.routes.routes, _defineProperty({}, route.name, route))
        }
      });
    case types.REMOVE_ROUTE:
      name = action.payload;
      ids = [].concat(_toConsumableArray(state.routes.ids));
      routes = _extends({}, state.routes.routes);
      ids.splice(ids.indexOf(name), 1);
      delete routes[name];
      return _extends({}, state, {
        routes: {
          ids: ids,
          routes: routes
        }
      });
    default:
      return state;
  }
};

module.exports = exports['default'];