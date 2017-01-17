'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Routes(_ref) {
  var dispatch = _ref.dispatch,
      children = _ref.children;

  return _react2.default.createElement(
    'div',
    { style: { display: 'none' } },
    children && _react2.default.cloneElement(children, { dispatch: dispatch })
  );
}

Routes.propTypes = {
  dispatch: _react.PropTypes.func,
  children: _react.PropTypes.any
};

exports.default = (0, _reactRedux.connect)()(Routes);
module.exports = exports['default'];