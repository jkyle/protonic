'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Stack = function () {
  function Stack() {
    var size = arguments.length <= 0 || arguments[0] === undefined ? 20 : arguments[0];
    var debug = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

    _classCallCheck(this, Stack);

    this.stack = _immutable2.default.List().setSize(size);
    this.debug = debug;
  }

  _createClass(Stack, [{
    key: 'addToStack',
    value: function addToStack(item) {
      if (this.debug) {
        this.stack = this.stack.shift().push(item);
      }
    }
  }, {
    key: 'pushAction',
    value: function pushAction(fn, args) {
      this.addToStack(_immutable2.default.Map({ type: 'ACTION', name: fn, args: args }));
    }
  }, {
    key: 'pushState',
    value: function pushState(name, state) {
      this.addToStack(_immutable2.default.Map({ type: 'STATE', name: name, state: state }));
      if (this.debug && this.testFn && this.testFn(state)) {
        this.dumpWhenCb(this.dump());
      }
    }
  }, {
    key: 'pushTransformer',
    value: function pushTransformer(fn, args) {
      this.addToStack(_immutable2.default.Map({ type: 'TRANSFORMER', name: fn, args: args }));
    }
  }, {
    key: 'pushLog',
    value: function pushLog(text) {
      this.addToStack(_immutable2.default.Map({ type: 'LOG', text: text }));
    }
  }, {
    key: 'dump',
    value: function dump() {
      return this.stack.filter(function (item) {
        return item;
      });
    }
  }, {
    key: 'dumpWhen',
    value: function dumpWhen(testFn, dumpFn) {
      this.testFn = testFn;
      this.dumpWhenCb = dumpFn;
    }
  }, {
    key: 'dumpToLog',
    value: function dumpToLog(stateAccessor) {
      var toLog = {
        ACTION: function ACTION(item) {
          return console.log('%cACTION ' + '%c' + item.get('name') + '\n', 'font-weight: bold; color: #629456', 'font-style: italic; color: #004', item.get('args'));
        },
        LOG: function LOG(item) {
          return console.log('%cLOG\n' + item.get('text'), 'background: #eee; color: #555');
        },
        TRANSFORMER: function TRANSFORMER(item) {
          return console.log('%cTRANSFORMER ' + '%c' + item.get('name') + '\n', 'font-weight: bold; color: #D08A10', 'font-style: italic; color: #004', item.get('args'));
        },
        STATE: function STATE(item) {
          var stateAccessor = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
          return console.log('%cSTATE ' + '%c' + item.get('name') + '\n', 'font-weight: bold; color: #3B74C4', 'font-style: italic; color: #004', item.getIn(['state'].concat(stateAccessor)).toJS());
        }
      };

      if (this.debug) {
        this.stack.map(function (item, index) {
          if (item) {
            toLog[item.get('type')](item, stateAccessor);
          }
        });
      }
    }
  }, {
    key: 'size',
    set: function set(newSize) {
      this.stack.setSize(newSize);
    },
    get: function get() {
      return this.stack.size;
    }
  }]);

  return Stack;
}();

exports.default = Stack;