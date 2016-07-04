'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /** Requires Immutable */


var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * A Stack isn't a stream, but can be used in conjunction with streams, actions, and
 * transformers to make debugging much easier. Using `pushAction`, 'pushState`,
 * `pushTransformer`, and `pushLog`, you can create a log of state changes and
 * their causes. Calling `dump`, `dumpToLog`, and `dumpWhen` will give you control
 * over when to view to stack.
 */

var Stack = function () {

  /**
   * constructor - A stack takes a size for the stack and a boolean to determine
   * whether the stack should be enabled on creation.
   *
   * @access public
   * @param  {number} size = 20     The size of the stack.
   * @param  {boolean} debug = false
   * @return {Stack}
   */

  function Stack() {
    var size = arguments.length <= 0 || arguments[0] === undefined ? 20 : arguments[0];
    var debug = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

    _classCallCheck(this, Stack);

    /**
     * @access private
     */
    this.stack = _immutable2.default.List().setSize(size);

    /**
     * @access public
     */
    this.debug = debug;
  }

  /**
   * addToStack - Removes the oldest item from the stack,
   * and adds a new item to the stack.
   *
   * @access private
   * @param  {Immutable.Map} item The new item to add to the stack.
   */


  _createClass(Stack, [{
    key: 'addToStack',
    value: function addToStack(item) {
      if (this.debug) {
        this.stack = this.stack.shift().push(item);
      }
    }

    /**
     * pushAction - Adds an action to the stack.
     *
     * @access public
     * @param  {string} fnName Name of the action called.
     * @param  {object} args Arguments to the action called.
     */

  }, {
    key: 'pushAction',
    value: function pushAction(fnName, args) {
      this.addToStack(_immutable2.default.Map({ type: 'ACTION', name: fnName, args: args }));
    }

    /**
     * pushState - Adds a state Map to the stack.
     *
     * @access public
     * @param  {string} name     Name of the stream that's adding state
     * @param  {Immutable.Map} state      The state object to add to the stack.
     * @param  {string} streamType The type of stream (View, Funnel, Stream) adding the state.
     */

  }, {
    key: 'pushState',
    value: function pushState(name, state, streamType) {
      this.addToStack(_immutable2.default.Map({ type: 'STATE', name: name, state: state, streamType: streamType }));
      if (this.testFn && this.testFn(state)) {
        this.dumpWhenCb(this.dump());
      }
    }

    /**
     * pushTransformer - Adds a transformer to the stack.
     *
     * @access public
     * @param  {string} fnName Name of the transformer called.
     * @param  {object} args Arguments to the transformer called.
     */

  }, {
    key: 'pushTransformer',
    value: function pushTransformer(fnName, args) {
      this.addToStack(_immutable2.default.Map({ type: 'TRANSFORMER', name: fnName, args: args }));
    }

    /**
     * pushLog - Adds a text log to the stack.
     *
     * @param  {string} text The text to be added to the stack.
     */

  }, {
    key: 'pushLog',
    value: function pushLog(text) {
      this.addToStack(_immutable2.default.Map({ type: 'LOG', text: text }));
    }

    /**
     * dump - Returns the stack, removing any undefined items.
     *
     * @return {Immutable.List}  the stack.
     */

  }, {
    key: 'dump',
    value: function dump() {
      return this.stack.filter(function (item) {
        return item;
      });
    }

    /**
     * dumpWhen - adds a test function to the stack that will run whenever
     * new state is added to the stack. The test function takes the state
     * as an argument and returns a boolean. If the test function returns
     * true, it will then run the callback function, passing the current
     * stack as an argument.
     *
     * @param  {function} testFn takes state as an argument and returns a boolean.
     * @param  {function} callbackFn takes the current stack as an argument
     */

  }, {
    key: 'dumpWhen',
    value: function dumpWhen(testFn, callbackFn) {

      /**
       * @access private
       */
      this.testFn = testFn;

      /**
       * @access = private
       */
      this.dumpWhenCb = callbackFn;
    }

    /**
     * dumpToLog - When dumpToLog is called, it logs out the current stack to
     * the console, formatting the different types of items in the stack for
     * clarity. It takes an optional array for only logging a particular
     * part of the state objects.
     *
     * @param  {array} stateAccessor takes an array of strings for logging only a certain part of the state
     */

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
          return console.log('%cSTATE ' + (item.streamType ? '(' + item.streamType + ')' : '') + '%c' + item.get('name') + '\n', 'font-weight: bold; color: #3B74C4', 'font-style: italic; color: #004', item.getIn(['state'].concat(stateAccessor)).toJS());
        }
      };

      if (this.debug) {
        this.stack.map(function (item) {
          if (item) {
            toLog[item.get('type')](item, stateAccessor);
          }
        });
      }
    }

    /**
     * set size - sets the size of the stack.
     *
     * @access public
     * @param  {number} newSize new size for the stack.
     */

  }, {
    key: 'size',
    set: function set(newSize) {
      this.stack.setSize(newSize);
    }

    /**
     * get size - getter for returning the current size of the stack.
     *
     * @return {number}  returns size of the stack
     */
    ,
    get: function get() {
      return this.stack.size;
    }
  }]);

  return Stack;
}();

/** @ignore Export the Stack class. */


exports.default = Stack;