'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.matchedRoute = matchedRoute;
exports.oldState = oldState;
exports.oldParams = oldParams;
exports.matchedRoutes = matchedRoutes;
exports.stateExists = stateExists;
function matchedRoute(state, name) {
  return state.routing.matchedRoutes.some(function (route) {
    return route === name;
  });
}

function oldState(state, route) {
  return state.routing.routes.routes[route].state;
}

function oldParams(state, route) {
  return state.routing.routes.routes[route].params;
}

function matchedRoutes(state) {
  return state.routing.matchedRoutes;
}

function stateExists(state, template) {
  var fullState = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

  var full = fullState || state;
  var keys = Object.keys(template);
  return keys.reduce(function (valid, key) {
    if (!valid) return false;
    if (template[key] instanceof Function) {
      return template[key](state[key], full);
    }
    switch (_typeof(template[key])) {
      case 'object':
        if (template[key] === null) {
          return state[key] === null;
        }
        if (Array.isArray(template[key])) {
          return Array.isArray(state[key]);
        }
        return stateExists(state[key], template[key], full);
      default:
        return _typeof(template[key]) === _typeof(state[key]);
    }
  }, true);
}