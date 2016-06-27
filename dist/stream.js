'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Stream = function () {
  function Stream(initial_state) {
    _classCallCheck(this, Stream);

    if (initial_state && !_immutable2.default.Iterable.isIterable(initial_state)) {
      throw new TypeError('initial_state must be immutable');
    }

    this._state = initial_state;
    this.views = _immutable2.default.Map();
    this.observers = _immutable2.default.List();
  }

  _createClass(Stream, [{
    key: 'subscribe',
    value: function subscribe(observer) {
      var _this = this;

      this.observers = this.observers.push(observer);
      if (this._state) {
        observer(this._state);
      }
      return {
        unsubscribe: function unsubscribe() {
          var idx = _this.observers.indexOf(observer);
          if (idx >= 0) {
            _this.observers = _this.observers.delete(_this.observers.indexOf(observer));
          } else {
            throw new RangeError('Observer is not subscribed to this stream.');
          }
        }
      };
    }
  }, {
    key: 'sendState',
    value: function sendState(value) {
      var _this2 = this;

      this._state = value;
      this.observers.forEach(function (observer) {
        return observer(_this2._state);
      });
    }
  }, {
    key: 'next',
    value: function next(value) {
      if (!_immutable2.default.is(this._state, value)) {
        this.sendState(value);
      }
    }
  }, {
    key: 'state',
    get: function get() {
      return this._state;
    },
    set: function set(newState) {
      this.next(newState);
    }
  }]);

  return Stream;
}();

exports.default = Stream;