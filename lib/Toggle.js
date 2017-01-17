'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _DisplaysChildren = require('./DisplaysChildren');

var _DisplaysChildren2 = _interopRequireDefault(_DisplaysChildren);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

exports.default = function (isActive) {
  var loaded = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {
    return true;
  };
  var componentLoadingMap = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  function Toggle(_ref) {
    var _ref$component = _ref.component,
        component = _ref$component === undefined ? _DisplaysChildren2.default : _ref$component,
        _ref$loading = _ref.loading,
        loading = _ref$loading === undefined ? function () {
      return null;
    } : _ref$loading,
        children = _ref.children,
        props = _objectWithoutProperties(_ref, ['component', 'loading', 'children']);

    var Component = component;
    var Loading = loading;
    var useProps = _extends({}, props);
    if (componentLoadingMap.component) {
      useProps.component = props[componentLoadingMap.component];
      useProps[componentLoadingMap.component] = undefined;
    }
    if (componentLoadingMap.loading) {
      useProps.loading = props[componentLoadingMap.loading];
      useProps[componentLoadingMap.loading] = undefined;
    }

    var NullComponent = function NullComponent(_ref2) {
      var loaded = _ref2['@@__loaded'],
          nullProps = _objectWithoutProperties(_ref2, ['@@__loaded']);

      return (// eslint-disable-line
        !loaded ? _react2.default.createElement(Loading, nullProps) // eslint-disable-line
        : nullProps['@@__isActive'] ? _react2.default.createElement(Component, nullProps) : null
      );
    };

    NullComponent.propTypes = {
      '@@__loaded': _react.PropTypes.bool,
      '@@__isActive': _react.PropTypes.bool
    };

    var R = (0, _reactRedux.connect)(function (state, rProps) {
      var __loaded = loaded(state, rProps); // eslint-disable-line
      return _extends({}, rProps, {
        '@@__isActive': __loaded && isActive(state, rProps),
        '@@__loaded': __loaded
      });
    })(NullComponent);

    R.displayName = 'Toggle(' + (Component.displayName || Component.name || 'Component') + ')';
    return _react2.default.createElement(
      R,
      useProps,
      children
    );
  }

  Toggle.propTypes = {
    component: _react.PropTypes.element,
    loading: _react.PropTypes.element,
    children: _react.PropTypes.any
  };
  return Toggle;
};

module.exports = exports['default'];