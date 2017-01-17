'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Link = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _reactRedux = require('react-redux');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _index = require('./index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Link = function (_Component) {
  _inherits(Link, _Component);

  function Link(props) {
    _classCallCheck(this, Link);

    var _this = _possibleConstructorReturn(this, (Link.__proto__ || Object.getPrototypeOf(Link)).call(this, props));

    _this.click = _this.click.bind(_this);
    return _this;
  }

  _createClass(Link, [{
    key: 'click',
    value: function click(e) {
      e.preventDefault();
      if (this.props.replace) {
        this.props.dispatch((0, _index.replace)(this.props.replace));
      } else {
        this.props.dispatch((0, _index.push)(this.props.to));
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var landing = this.props.replace || this.props.to;
      if (landing.pathname) {
        landing = '' + landing.pathname + ('' + landing.search) + ('' + landing.hash); // eslint-disable-line prefer-template
      }
      return _react2.default.createElement(
        'a',
        { href: landing, onClick: this.click },
        this.props.children
      );
    }
  }]);

  return Link;
}(_react.Component);

Link.propTypes = {
  to: _react.PropTypes.oneOfType([_react.PropTypes.string, _react.PropTypes.shape({
    pathname: _react.PropTypes.string,
    search: _react.PropTypes.string,
    hash: _react.PropTypes.string,
    state: _react.PropTypes.any
  })]),
  replace: _react.PropTypes.string,
  dispatch: _react.PropTypes.func.isRequired,
  children: _react.PropTypes.any
};
exports.Link = Link;
exports.default = (0, _reactRedux.connect)(function () {
  return {};
}, function (dispatch) {
  return { dispatch: dispatch };
})(Link);