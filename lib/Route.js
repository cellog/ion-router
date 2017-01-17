'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.fake = fake;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _actions = require('./actions');

var actions = _interopRequireWildcard(_actions);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function fake() {
  return {};
}

var Route = function (_Component) {
  _inherits(Route, _Component);

  function Route(props) {
    _classCallCheck(this, Route);

    var _this = _possibleConstructorReturn(this, (Route.__proto__ || Object.getPrototypeOf(Route)).call(this, props));

    var dispatch = props.dispatch,
        parentUrl = props.parentUrl,
        children = props.children,
        params = _objectWithoutProperties(props, ['dispatch', 'parentUrl', 'children']); // eslint-disable-line no-unused-vars


    var slash = parentUrl && parentUrl[parentUrl.length - 1] === '/' ? '' : '/';
    var path = parentUrl ? '' + parentUrl + slash + params.path : params.path;
    dispatch(actions.createRoute(_extends({}, params, { path: path })));
    _this.url = path;
    return _this;
  }

  _createClass(Route, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          dispatch = _props.dispatch,
          children = _props.children;

      return _react2.default.createElement(
        'div',
        { style: { display: 'none' } },
        children && _react2.default.cloneElement(children, { dispatch: dispatch, parentUrl: this.url })
      );
    }
  }]);

  return Route;
}(_react.Component);

Route.propTypes = {
  name: _react.PropTypes.string.isRequired,
  path: _react.PropTypes.string.isRequired,
  paramsFromState: _react.PropTypes.func,
  stateFromParams: _react.PropTypes.func,
  updateState: _react.PropTypes.object,
  dispatch: _react.PropTypes.func,
  parentUrl: _react.PropTypes.string,
  children: _react.PropTypes.any
};
Route.defaultProps = {
  paramsFromState: fake,
  stateFromParams: fake,
  updateState: {}
};
exports.default = Route;