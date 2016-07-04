'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _stream = require('./stream');

var _stream2 = _interopRequireDefault(_stream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * A View is a kind of Stream that is useful for transforming the shape of state for
 * use in components or interfaces. A View caches the result of the function, and will
 * only emit state to subscribers if the new return value is distinct from the
 * previous value.
 *
 * @extends {Stream}
 */

var View = function (_Stream) {
  _inherits(View, _Stream);

  /**
   * constructor - Takes a source stream, and transforms it through a function.
   * The view function takes state from the source stream and transforms it into
   * returns a new shape of the state for use in a component or interface.
   *
   * @access public
   * @param  {Stream} source A stream to receive state from (can be a source stream or a funnel)
   * @param  {function} viewFn A function that takes state and returns a new shape for the state.
   * @returns {View}
   */

  function View(source, viewFn) {
    _classCallCheck(this, View);

    if (!source || !(source instanceof _stream2.default)) {
      throw new Error('Views require a source stream.');
    }

    if (!viewFn || typeof viewFn !== 'function') {
      throw new Error('Views require a view function.');
    }

    /**
     * @access private
     */

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(View).call(this));

    _this.source = source;

    /**
     * @access private
     */
    _this.sourceSubscriber = source.subscribe(function (state) {
      return _this.next(viewFn(state));
    });

    /**
     * @access private;
     */
    _this.type = 'VIEW';
    return _this;
  }

  /**
   * forceState - Overrides the base Stream class's forceState.
   * A View cannot receive new state through forceState.
   * @access private
   * @override
   */


  _createClass(View, [{
    key: 'forceState',
    value: function forceState() {
      throw new Error('Cannot force state on a View.');
    }

    /**
     * destroy - Clean up subscriptions.
     *
     * @access public
     */

  }, {
    key: 'destroy',
    value: function destroy() {
      this.sourceSubscriber.unsubscribe();
    }
  }]);

  return View;
}(_stream2.default);

/** @ignore Export the View class. */


exports.default = View;