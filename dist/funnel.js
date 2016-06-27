'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _stream = require('./stream');

var _stream2 = _interopRequireDefault(_stream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Funnel = function (_StateStream) {
  _inherits(Funnel, _StateStream);

  function Funnel(sourceMap) {
    _classCallCheck(this, Funnel);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Funnel).call(this, _immutable2.default.Map()));

    _this.primed = false;
    _this.sourceKeys = sourceMap.keySeq();
    _this.subscribers = sourceMap.map(function (value, key) {
      return value.subscribe(function (valState) {
        _this.state = _this.state.set(key, valState);
      });
    });
    return _this;
  }

  _createClass(Funnel, [{
    key: 'sendState',
    value: function sendState(value) {
      if (this.primed) {
        _get(Object.getPrototypeOf(Funnel.prototype), 'sendState', this).call(this, value);
      } else {
        if (this.sourceKeys.every(function (source) {
          return value.get(source);
        })) {
          this.primed = true;
          _get(Object.getPrototypeOf(Funnel.prototype), 'sendState', this).call(this, value);
        } else {
          this._state = value;
        }
      }
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.subscribers.forEach(function (subscriber) {
        return subscriber.unsubscribe();
      });
    }
  }]);

  return Funnel;
}(_stream2.default);

exports.default = Funnel;