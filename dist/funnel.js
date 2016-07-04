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

/**
 * A Funnel is a special type of Stream that combines the states from feeder
 * streams.
 * @extends {Stream}
 */

var Funnel = function (_Stream) {
  _inherits(Funnel, _Stream);

  /**
   * A Funnel is a special type of Stream that combines the states from feeder
   * streams. Once all of the feeder streams have sent state, the Funnel will send the combined
   * state to any observers. When creating the Funnel, the sourceMap describes the shape of
   * the combined state. The key for each stream will be the key used to access the state of
   * that stream on the combined state object.
   *
   * @access public
   * @param  {Immutable.Map} sourceMap - a Map of the feeder streams.
   * @return {Funnel}           returns an instance of the Funnel stream.
   */

  function Funnel(sourceMap) {
    _classCallCheck(this, Funnel);

    if (!sourceMap) {
      throw new Error('You must supply a source map to a funnel');
    }

    if (!_immutable2.default.Iterable.isKeyed(sourceMap)) {
      throw new Error('You must supply an Immutable.Map as a source map to a funnel');
    }


    /**
     * @access private
     */

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Funnel).call(this, _immutable2.default.Map()));

    _this.primed = false;

    /**
     * @access private
     */
    _this.sourceMap = sourceMap;

    /**
     * @access private
     */
    _this.sourceKeys = sourceMap.keySeq();

    /**
     * @access private
     */
    _this.subscribers = sourceMap.map(function (sourceStream, key) {
      if (sourceStream.type === 'VIEW') {
        throw new Error('Funnels cannot subscribe to Views. At key ' + key);
      }

      return sourceStream.subscribe(function (newState) {

        /**
         * @ignore
         */
        _this.state = _this.state.set(key, newState);
      });
    });

    /**
     * @access private
     * @override
     */
    _this.type = 'FUNNEL';
    return _this;
  }

  /**
   * sendState - overrides Stream's `sendState` by enforcing that all feeder streams have
   * sent state before sending state on to observers. Once a Funnel is `primed` it will pass
   * state on, regardless if one stream sends `undefined`.
   *
   * @access private
   * @param  {Immutable} newState - new state (received internally from Stream's `next` method)
   * @override
   */


  _createClass(Funnel, [{
    key: 'sendState',
    value: function sendState(newState) {
      if (this.primed) {
        _get(Object.getPrototypeOf(Funnel.prototype), 'sendState', this).call(this, newState);
      } else {
        if (this.sourceKeys.every(function (source) {
          return newState.get(source);
        })) {
          this.primed = true;
          _get(Object.getPrototypeOf(Funnel.prototype), 'sendState', this).call(this, newState);
        } else {
          this._state = newState;
        }
      }
    }

    /**
     * subscribe - Overwrites base Stream class's subscribe method.
     * Funnels should not emit state to subscribers until all source
     * streams have defined state.
     *
     * @param  {function} observer the obeserver function to listen to state changes.
     * @return {object}          a subscriber object
     */

  }, {
    key: 'subscribe',
    value: function subscribe(observer) {
      var _this2 = this;

      /**
       * @ignore
       */
      this.observers = this.observers.push(observer);
      if (this.primed) {
        observer(this._state);
      }
      return {
        unsubscribe: function unsubscribe() {
          var idx = _this2.observers.indexOf(observer);
          if (idx >= 0) {
            _this2.observers = _this2.observers.delete(_this2.observers.indexOf(observer));
          } else {
            throw new RangeError('Observer is not subscribed to this stream.');
          }
        }
      };
    }

    /**
     * forceState - Funnels can accept new state an send state back up
     * the subscription chain. This should only be used in cases of
     * restoring state.
     *
     * @access public
     * @param  {Immutable} state The new state to hydrate the funnel.
     * @override
     */

  }, {
    key: 'forceState',
    value: function forceState(state) {
      this.sourceMap.forEach(function (sourceStream, key) {
        sourceStream.forceState(state.get(key));
      });
    }

    /**
     * destroy - cleans up a Funnel's feeder subscribers.
     *
     * @access public
     */

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

/** @ignore Export the Funnel class. */


exports.default = Funnel;