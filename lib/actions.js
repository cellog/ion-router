'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createRoute = createRoute;
exports.push = push;
exports.replace = replace;
exports.go = go;
exports.goBack = goBack;
exports.goForward = goForward;
exports.matchRoutes = matchRoutes;
exports.route = route;
exports.addRoute = addRoute;
exports.removeRoute = removeRoute;
exports.setParamsAndState = setParamsAndState;

var _types = require('./types');

var types = _interopRequireWildcard(_types);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function createRoute(params) {
  return {
    type: types.CREATE_ROUTE,
    payload: params
  };
}

function push(details) {
  return {
    type: types.ACTION,
    payload: {
      verb: 'push',
      route: details
    }
  };
}

function replace(details) {
  return {
    type: types.ACTION,
    payload: {
      verb: 'replace',
      route: details
    }
  };
}

function go(details) {
  return {
    type: types.ACTION,
    payload: {
      verb: 'go',
      route: details
    }
  };
}

function goBack() {
  return {
    type: types.ACTION,
    payload: {
      verb: 'goBack'
    }
  };
}

function goForward() {
  return {
    type: types.ACTION,
    payload: {
      verb: 'goForward'
    }
  };
}

function matchRoutes(routes) {
  return {
    type: types.MATCH_ROUTES,
    payload: routes
  };
}

function route(location) {
  return {
    type: types.ROUTE,
    payload: location
  };
}

function addRoute(name, url) {
  return {
    type: types.EDIT_ROUTE,
    payload: {
      name: name,
      url: url,
      params: {},
      state: {}
    }
  };
}

function removeRoute(name) {
  return {
    type: types.REMOVE_ROUTE,
    payload: name
  };
}

function setParamsAndState(details, params, state) {
  return {
    type: types.SET_PARAMS,
    payload: {
      route: details,
      params: params,
      state: state
    }
  };
}